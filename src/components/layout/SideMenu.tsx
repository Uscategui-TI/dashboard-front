'use client';

import { FiLogOut } from "react-icons/fi";
import { DropdownSelect } from '@/components/ui/dropdown';
import React, { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { FaImage, FaWhatsapp, FaHome, FaUsers } from "react-icons/fa";
import { BsRobot } from 'react-icons/bs';
import { rolePermissions } from '@/hooks/modal/auth/rolesPermissions';
import { useRouter } from "next/navigation";
import axios from 'axios';

const subRoutes = [
    { name: 'Campañas', url: '/mycenter/attractions', icon: <FaWhatsapp className="w-6 h-6"/> },
    { name: 'Bot', url: '/mycenter/tours', icon: <BsRobot className="w-6 h-6"/> },
    { name: 'Prospectos', url: '/mycenter/accommodations', icon: <FaUsers className="w-6 h-6"/> }
];

export const SideMenu = () => {
    const [allowedMenuItems, setAllowedMenuItems] = useState<string[]>([]);
    const router = useRouter();
    const [initialToken, setInitialToken] = useState<string | null>(null);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("roles");
        router.push("http://localhost:3000/auth/sing-in");
    },[router]);


    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        setInitialToken(storedToken); // Guarda el token original al cargar

        const fetchRoles = async () => {
            if (!storedToken) {
                handleLogout();
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/api/auth/role', {
                    headers: { 'Authorization': `Bearer ${storedToken}` },
                    withCredentials: true,
                });

                const data = response.data;
                const roles = data?.roles || [];

                if (roles.length === 0) {
                    handleLogout();
                    return;
                }

                localStorage.setItem("roles", JSON.stringify(roles));

                const allowedItems: string[] = [];
                roles.forEach((role: string) => {
                    if (rolePermissions[role]) {
                        allowedItems.push(...rolePermissions[role]);
                    }
                });

                setAllowedMenuItems([...new Set(allowedItems)]);
            } catch (error) {
                console.error("Error fetching roles:", error);
                handleLogout();
            }
        };

        fetchRoles();
    }, [handleLogout]);

    // Monitorea si el token fue modificado
    useEffect(() => {
        const checkTokenChange = () => {
            const currentToken = localStorage.getItem("authToken");
            if (initialToken && currentToken !== initialToken) {
                console.warn("Token modificado, cerrando sesión...");
                handleLogout();
            }
        };

        window.addEventListener("storage", checkTokenChange);
        return () => window.removeEventListener("storage", checkTokenChange);
    }, [initialToken, handleLogout]);

    

    return (
        <>
            <aside
                id="sidebar"
                className="fixed hidden top-0 left-0 z-20 flex-col flex-shrink-0 w-64 h-full pt-16 font-normal duration-75 lg:flex transition-width"
                aria-label="Sidebar"
            >
                <div className="relative flex flex-col flex-1 min-h-0 pt-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
                        <div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            <ul className="pb-2 space-y-2">
                                {/* Elementos del Sidebar */}
                                <li>
                                    <NextLink href={`/mycenter?centerId=`} passHref legacyBehavior>
                                        <div className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                                            <svg
                                                className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                                                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                                            </svg>
                                            <span className="ml-3">Dashboard</span>
                                        </div>
                                    </NextLink>
                                </li>
                                
                                {/* Menú Mi centro */}
                                <li>
                                    <DropdownSelect
                                        buttonText="Mi centro"
                                        icon={
                                            <FaHome className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
                                        }
                                    >
                                        {subRoutes.map((subRoute, index) => (
                                            allowedMenuItems.includes(subRoute.name) && (
                                                <li key={index}>
                                                    <NextLink
                                                        href={`${subRoute.url}?centerId=`}
                                                        passHref
                                                        legacyBehavior
                                                    >
                                                        <div
                                                            className={`flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg pl-5 group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700`}
                                                        >
                                                            {subRoute.icon}
                                                            <span className="ml-3">{subRoute.name}</span>
                                                        </div>
                                                    </NextLink>
                                                </li>
                                            )
                                        ))}
                                    </DropdownSelect>
                                </li>

                                {/* Otros elementos */}
                                {allowedMenuItems.includes('Publicaciones') && (
                                    <li>
                                        <NextLink href={`/mycenter/publication?centerId=`} passHref legacyBehavior>
                                            <div className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                                                <FaImage className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
                                                <span className="ml-3">Publicaciones</span>
                                            </div>
                                        </NextLink>
                                    </li>
                                )}

                                {allowedMenuItems.includes('Multimedia') && (
                                    <li>
                                        <NextLink href={`/mycenter/multimedia?centerId=`} passHref legacyBehavior>
                                            <div className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                                                <FaImage className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
                                                <span className="ml-3">Multimedia</span>
                                            </div>
                                        </NextLink>
                                    </li>
                                )}

                                {allowedMenuItems.includes('Usuarios') && (
                                    <li>
                                        <NextLink href={`/mycenter/users?centerId=`} passHref legacyBehavior>
                                            <div className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                                                <FaUsers className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
                                                <span className="ml-3">Usuarios</span>
                                            </div>
                                        </NextLink>
                                    </li>
                                )}

                                {allowedMenuItems.includes('Configuraciones') && (
                                    <li>
                                        <NextLink href={`/mycenter/account?centerId=`} passHref legacyBehavior>
                                            <div className="flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                                                <svg
                                                    className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        clipRule="evenodd"
                                                        fillRule="evenodd"
                                                        d="M8.34 1.804A1 1 0 019.32 1h1.36a1 1 0 01.98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 011.262.125l.962.962a1 1 0 01.125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 01.804.98v1.361a1 1 0 01-.804.98l-1.473.295a6.95 6.95 0 01-.587 1.416l.834 1.25a1 1 0 01-.125 1.262l-.962.962a1 1 0 01-1.262.125l-1.25-.834a6.953 6.953 0 01-1.416.587l-.294 1.473a1 1 0 01-.98.804H9.32a1 1 0 01-.98-.804l-.295-1.473a6.957 6.957 0 01-1.416-.587l-1.25.834a1 1 0 01-1.262-.125l-.962-.962a1 1 0 01-.125-1.262l.834-1.25a6.957 6.957 0 01-.587-1.416l-1.473-.294A1 1 0 011 10.68V9.32a1 1 0 01.804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 01.125-1.262l.962-.962A1 1 0 015.38 3.03l1.25.834a6.957 6.957 0 011.416-.587l.294-1.473zM13 10a3 3 0 11-6 0 3 3 0 016 0z"
                                                    ></path>
                                                </svg>
                                                <span className="ml-3">Configuraciones</span>
                                            </div>
                                        </NextLink>
                                    </li>
                                )}
                            </ul>
                            <div className="pt-2 space-y-2">
                                <NextLink href={`/mycenter/help-center?centerId=`} passHref legacyBehavior>
                                    <div className="flex items-center p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700">
                                        <svg
                                            className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.186L8.86 9.262c-.296-.31-.625-.616-.967-.905L6.156 7.727a7.957 7.957 0 00-.533 1.394l1.448 1.449A5.981 5.981 0 017.177 10c0 .993.241 1.929.668 2.754l1.524-1.525a3.997 3.997 0 00-.078-2.183z"
                                            ></path>
                                        </svg>
                                        <span className="ml-3">Centro de ayuda</span>
                                    </div>
                                </NextLink>
                            </div>
                            <li>
                            <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center p-2 text-base text-gray-900 transition rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    <FiLogOut className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
                                    <span className="ml-3">Cerrar sesión</span>
                                </button>
                            </li>
                            
                            
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
