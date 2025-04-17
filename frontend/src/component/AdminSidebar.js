import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import {
    Home, Upload, BarChart3, Users, Settings,
    Sparkle, WandSparkles, LineChart
} from 'lucide-react';

function AdminSidebar({ onLogout }) {
    return (
        <div className="flex flex-col space-y-4 p-4 mt-12 bg-[#1e293b] text-white h-[95vh]">
        <Link to="/">
                <Button color="secondary" variant="solid" startContent={<Home />} className="w-full">
                    Home
                </Button>
            </Link>
            <Link to="/upload">
                <Button color="primary" variant="solid" startContent={<Upload />} className="w-full">
                    Upload Data
                </Button>
            </Link>
            <Link to="/forecast">
                <Button color="success" variant="solid" startContent={<BarChart3 />} className="w-full">
                    Forecast
                </Button>
            </Link>
            <Link to="/predict">
                <Button color="warning" variant="solid" startContent={<WandSparkles />} className="w-full">
                    Predict
                </Button>
            </Link>
            <Link to="/admin/users">
                <Button color="danger" variant="solid" startContent={<Users />} className="w-full">
                    Manage Users
                </Button>
            </Link>
          {/*  <Link to="/admin/settings">
                <Button color="default" variant="solid" startContent={<Settings />} className="w-full">
                    Settings
                </Button>
            </Link>*/}
            <Link to="/forecast-analysis">
                <Button color="secondary" variant="solid" startContent={<LineChart />} className="w-full">
                    Forecast Analysis
                </Button>
            </Link>
        </div>
    );
}

export default AdminSidebar;