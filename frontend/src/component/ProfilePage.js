import React, { useState, useEffect} from 'react';
import { Card } from "@nextui-org/react";
import './design/ProfilePage.css';

function ProfilePage({ user, onUpdate }) {
    const [editMode, setEditMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user && user.username) {
            setUsername(user.username);
        }
    }, [user]);


    const handleSave = async () => {
        try {
            const response = await fetch(`/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    username,
                    password,
                    roles: user.roles.map(r => r.name),
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                onUpdate(updatedUser); // Обновляем данные пользователя в родителе
                setMessage('✅ Profile updated successfully!');
                setEditMode(false);
            } else {
                const err = await response.text();
                setMessage('❌ Error: ' + err);
            }
        } catch (error) {
            setMessage('❌ Error: ' + error.message);
        }
    };

    return (
        <div className="profile-page">
            <Card className="profile-card">
                <h2 className="profile-title">User Profile</h2>

                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    disabled={!editMode}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label>New Password:</label>
                <input
                    type="password"
                    value={password}
                    disabled={!editMode}
                    placeholder="Leave blank to keep current"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label>Roles:</label>
                <ul className="roles-list">
                    {user.roles.map((role, i) => (
                        <li key={i}>{role.name}</li>
                    ))}
                </ul>

                {editMode ? (
                    <div className="btn-group">
                        <button onClick={handleSave} className="save-btn">Save</button>
                        <button onClick={() => setEditMode(false)} className="cancel-btn">Cancel</button>
                    </div>
                ) : (
                    <button onClick={() => setEditMode(true)} className="edit-btn">Edit Profile</button>
                )}

                {message && <p className="message">{message}</p>}
            </Card>
        </div>
    );
}

export default ProfilePage;
