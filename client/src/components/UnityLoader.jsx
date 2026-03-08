/* Copyright (C) 2026 Eric Yugo Hioki, Alex Silveira de Campos, Eduardo de Senzi Zancul

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>. */


import React, { useEffect } from 'react';

export default function UnityLoader() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/unity/Build/UnityLoader.js';
        script.onload = () => {
            if (window.UnityLoader) {
                window.UnityLoader.instantiate(
                    'unityContainer',
                    '/unity/Build/Build.json'
                );
            } else {
                console.error('UnityLoader is not defined');
            }
        };
        script.onerror = () => {
            console.error('Failed to load UnityLoader.js');
        };
        document.body.appendChild(script);
    }, []);

    return <div id="unityContainer" style={{ width: '100%', height: '100%' }} />;
}