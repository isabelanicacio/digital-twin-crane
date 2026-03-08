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


import React, { useEffect, useRef } from 'react';

const UnityComponent = () => {
    const unityContainerRef = useRef(null);

    useEffect(() => {
        console.log('UnityComponent mounted');
        const script = document.createElement('script');
        script.src = 'unityBuild/Build/unityBuild.loader.js'; // Adjust the path as needed
        script.onload = () => {
            console.log('Unity loader script loaded');
            window.createUnityInstance(unityContainerRef.current, {
                dataUrl: 'unityBuild/Build/unityBuild.data',
                frameworkUrl: 'unityBuild/Build/unityBuild.framework.js',
                codeUrl: 'unityBuild/Build/unityBuild.wasm',
                streamingAssetsUrl: "StreamingAssets",
                companyName: "DefaultCompany",
                productName: "MyProductName",
                productVersion: "1.0",
            }).then((unityInstance) => {
                console.log('Unity instance loaded');
            }).catch((message) => {
                console.error('Error loading Unity instance:', message);
            });
        };
        script.onerror = () => {
            console.error('Error loading Unity loader script');
        };
        document.body.appendChild(script);

        return () => {
            console.log('UnityComponent unmounted');
            document.body.removeChild(script);
        };
    }, []);

    return <div id="unityContainer" ref={unityContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default UnityComponent;