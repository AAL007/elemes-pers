import React, { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
    isSidebarOpen: boolean;
    isMobileSidebarOpen: boolean;
    toggleSidebar: () => void;
    toggleMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    const toggleSidebar = () => setSidebarOpen((prev) => !prev)

    const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev)

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, isMobileSidebarOpen, toggleSidebar, toggleMobileSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}