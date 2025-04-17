import React from 'react';
import {Link} from 'react-router-dom';
import {Button} from '@nextui-org/react';
import {Home, Upload, BarChart3, WandSparkles} from 'lucide-react';

function AnalystSidebar() {
    return (
        <div className="flex flex-col space-y-4 p-4 bg-[#1e293b] text-white h-[95vh]">
            <Link to="/">
                <Button color="secondary" variant="solid" startContent={<Home/>} className="w-full">
                    Home
                </Button>
            </Link>
            <Link to="/upload">
                <Button color="primary" variant="solid" startContent={<Upload/>} className="w-full">
                    Upload Data
                </Button>
            </Link>
            <Link to="/forecast">
                <Button color="success" variant="solid" startContent={<BarChart3/>} className="w-full">
                    Forecast
                </Button>
            </Link>
            <Link to="/predict">
                <Button color="warning" variant="solid" startContent={<WandSparkles/>} className="w-full">
                    Predict
                </Button>
            </Link>
        </div>
    );
}

export default AnalystSidebar;