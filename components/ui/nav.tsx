'use client'
import { UserButton } from "@clerk/nextjs";
import React from 'react';

const NavBar: React.FC = () => {
    return ( 
        <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1l4 4 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-medium text-gray-100">Storage</h1>
                </div>
                <div>
                    <UserButton 
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8",
                                userButtonPopoverCard: "bg-gray-900 border border-gray-800",
                                userButtonPopoverActionButton: "text-gray-300 hover:bg-gray-800",
                                userButtonPopoverActionButtonText: "text-gray-300",
                                userButtonPopoverActionButtonIcon: "text-gray-400"
                            }
                        }}
                    />
                </div>
            </div>
        </nav>
    )
}
export default NavBar;