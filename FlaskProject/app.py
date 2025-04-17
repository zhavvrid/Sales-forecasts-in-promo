import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sqlalchemy import create_engine
from datetime import datetime, timedelta
import sys
import uuid
import numpy as np
import json

DB_CONFIG = {
    'host': 'localhost',
    'port': '3306',
    'db': 'spring_security',
    'user': 'root',
    'password': 'root'
}

def cast_param_types(params):
    converted = {}
    for k, v in params.items():
        if isinstance(v, str) and v.isdigit():
            converted[k] = int(v)
        else:
            converted[k] = v
    return converted

user_id = int(sys.argv[1]) if len(sys.argv) > 1 else None
product_filter_id = sys.argv[2] if len(sys.argv) > 2 else None
promotion_filter_id = sys.argv[3] if len(sys.argv) > 3 else None
model_type = sys.argv[4] if len(sys.argv) > 4 else "random_forest"
model_params = json.loads(sys.argv[5]) if len(sys.argv) > 5 else {}
model_params = cast_param_types(model_params)
print(f"Using model: {model_type}, Params: {model_params}")


def get_db_connection():
    db_url = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['db']}"
    return create_engine(db_url)




def load_data():
    """Загрузка данных из БД"""
    query = """
    SELECT 
        p.id as product_id, p.name as product_name, p.category, p.price,
        pr.id as promo_id, pr.name as promo_name, pr.discount,
        pr.start_date as promo_start, pr.end_date as promo_end,
        s.date as sale_date, s.quantity
    FROM sales s
    JOIN products p ON s.product_id = p.id
    LEFT JOIN promotions pr ON s.promo_id = pr.id
    """
    engine = get_db_connection()
    df = pd.read_sql(query, engine)
    if product_filter_id and product_filter_id.lower() != 'all':
        query += f" AND p.id = '{product_filter_id}'"  # <-- Эта строка не работает!
    if promotion_filter_id and promotion_filter_id.lower() != 'none':
        query += f" AND pr.id = '{promotion_filter_id}'"  # <-- И эта тоже!
    for col in ['sale_date', 'promo_start', 'promo_end']:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col])

    return df

def preprocess_data(df):
    """Предобработка данных"""
    # Проверка наличия необходимых колонок
    required_cols = ['sale_date', 'quantity', 'category', 'price']
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    df['day_of_week'] = df['sale_date'].dt.dayofweek
    df['month'] = df['sale_date'].dt.month

    if 'promo_start' in df.columns and 'promo_end' in df.columns:
        df['promo_duration'] = (df['promo_end'] - df['promo_start']).dt.days
        df['days_since_promo_start'] = (df['sale_date'] - df['promo_start']).dt.days
        df['is_promo'] = df['promo_id'].notna().astype(int)
    else:
        df['is_promo'] = 0
        df['promo_duration'] = 0
        df['days_since_promo_start'] = 0

    categories = pd.get_dummies(df['category'], prefix='category')
    df = pd.concat([df, categories], axis=1)

    return df


def train_model(X, y, model_type="random_forest", params={}):
    """Обучение модели с указанным типом"""
    if model_type == "random_forest":
        model = RandomForestRegressor(**params)
    elif model_type == "gradient_boosting":
        from sklearn.ensemble import GradientBoostingRegressor
        model = GradientBoostingRegressor(**params)
    elif model_type == "decision_tree":
        from sklearn.tree import DecisionTreeRegressor
        model = DecisionTreeRegressor(**params)
    elif model_type == "linear_regression":
        from sklearn.linear_model import LinearRegression
        model = LinearRegression(**params)
    else:
        raise ValueError(f"Unknown model type: {model_type}")

    model.fit(X, y)
    print(f"Model {model_type} training completed")
    return model


def generate_forecasts(model, products, promo=None):
    """Генерация прогнозов на 30 дней"""

    if product_filter_id and product_filter_id.lower() != 'all':
        products = [p for p in products if p['product_id'] == product_filter_id]

    future_dates = pd.date_range(start=datetime.now(), end=datetime.now() + timedelta(days=30))
    forecasts = []

    all_categories = [col for col in model.feature_names_in_ if col.startswith('category_')]

    for product in products:
        for date in future_dates:
            features = {
                'price': product['price'],
                'day_of_week': date.dayofweek,
                'month': date.month,
                'is_promo': 1 if promo is not None else 0
            }

            for cat in all_categories:
                features[cat] = 1 if cat == f"category_{product['category']}" else 0

            if promo is not None:
                try:
                    promo_start = pd.to_datetime(promo['promo_start'])
                    promo_end = pd.to_datetime(promo['promo_end'])
                    features.update({
                        'discount': promo['discount'],
                        'promo_duration': (promo_end - promo_start).days,
                        'days_since_promo_start': (date - promo_start).days
                    })
                except KeyError as e:
                    print(f"Missing promo data: {str(e)}")
                    continue

            try:
                X_pred = pd.DataFrame([features])[model.feature_names_in_]
                forecast_qty = max(0, round(model.predict(X_pred)[0]))
                forecasts.append({
                    'product_id': product['product_id'],
                    'date': date.date(),
                    'forecast_qty': forecast_qty,
                    'promo_id': promo['promo_id'] if promo is not None else None
                })
            except Exception as e:
                print(f"Prediction error: {str(e)}")
                continue

    return forecasts


def save_forecasts(forecasts):
    """Сохранение прогнозов в БД"""
    if not forecasts:
        print("No forecasts to save")
        return

    engine = get_db_connection()
    forecasts_df = pd.DataFrame(forecasts)

    forecasts_df['id'] = [str(uuid.uuid4()) for _ in range(len(forecasts_df))]
    forecasts_df['promo_id'] = promotion_filter_id
    forecasts_df['model_name'] = model_type
    forecasts_df['created_at'] = datetime.now()
    forecasts_df['created_by'] = user_id

    try:
        forecasts_df.to_sql('forecasts', engine, if_exists='append', index=False)
        print(f"Saved {len(forecasts_df)} forecasts to database")
    except Exception as e:
        print(f"Error saving forecasts: {str(e)}")
        raise


if __name__ == "__main__":
    try:
        print("=== Starting forecast generation ===")

        # 1. Загрузка данных
        print("Loading data from database...")
        df = load_data()
        if df.empty:
            raise ValueError("No data loaded from database")
        print(f"Loaded {len(df)} records")

        # 2. Предобработка
        print("Preprocessing data...")
        processed_df = preprocess_data(df)

        # Подготовка фичей и целевой переменной
        feature_cols = [col for col in processed_df.columns
                        if col not in ['quantity', 'product_id', 'product_name',
                                       'promo_id', 'promo_name', 'sale_date',
                                       'promo_start', 'promo_end', 'category']]
        X = processed_df[feature_cols]
        y = processed_df['quantity']

        print(f"Using {len(feature_cols)} features: {feature_cols}")

        # 3. Обучение модели
        print("Training model...")
        model = train_model(X, y, model_type, model_params)

        # 4. Генерация прогнозов
        print("Generating forecasts...")
        products = df[['product_id', 'price', 'category']].drop_duplicates().to_dict('records')

        # Проверяем наличие активных промо
        active_promo = None
        if 'promo_id' in df.columns and not df[df['promo_id'].notna()].empty:
            active_promo = df[df['promo_id'].notna()].iloc[0].to_dict()
            print(f"Using promo: {active_promo['promo_name']}")

        forecasts = generate_forecasts(model, products, active_promo)
        print(f"Generated {len(forecasts)} forecasts")

        # 5. Сохранение результатов
        print("Saving forecasts to database...")
        save_forecasts(forecasts)

        print("=== Forecast generation completed successfully ===")
        sys.exit(0)
    except Exception as e:
        print(f"!!! Error: {str(e)}", file=sys.stderr)
        sys.exit(1)