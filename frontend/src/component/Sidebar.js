import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Divider, Button } from "@nextui-org/react";
import { Link } from 'react-router-dom';
import { WandSparkles, Sparkle, Home } from 'lucide-react';

function Sidebar() {
    return (
        <Card
            className="h-[95vh] w-full"
            radius="lg"
            shadow="md"
            isBlurred
            isBordered
            classNames={{
                base: "bg-[#1e293b] text-white", // тёмный фон + белый текст
            }}
        >
            <CardHeader>
                <p className="text-lg font-bold">Dashboard</p>
            </CardHeader>
            <Divider className="bg-gray-600" />
            <CardBody>
                <div className="flex flex-col justify-center items-center space-y-6 mt-8">
                    <Link to="/upload">
                        <Button
                            color="primary"
                            variant="solid"
                            startContent={<Sparkle />}
                            className="w-[180px]"
                        >
                            Upload Data
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button
                            color="secondary"
                            variant="solid"
                            startContent={<Home />}
                            className="w-[180px]"
                        >
                            Home
                        </Button>
                    </Link>
                    <Link to="/xgb">
                        <Button
                            color="warning"
                            variant="solid"
                            startContent={<WandSparkles />}
                            className="w-[180px]"
                        >
                            Predict
                        </Button>
                    </Link>
                    <Link to="/forecast">
                        <Button
                            color="success"
                            variant="solid"
                            startContent={<Sparkle />}
                            className="w-[180px]"
                        >
                            Forecast Page
                        </Button>
                    </Link>
                </div>
            </CardBody>
            <Divider className="bg-gray-600" />
            <CardFooter />
        </Card>
    );
}

export default Sidebar;
