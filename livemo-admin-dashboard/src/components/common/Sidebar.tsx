import React, { useState } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Typography,
    Divider,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Store as StoreIcon,
    AttachMoney as MoneyIcon,
    Settings as SettingsIcon,
    ExpandLess,
    ExpandMore,
    VerifiedUser,
    Group,
    Category,
    Receipt,
    AccountBalance,
    HealthAndSafety,
    ShoppingCart
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

interface MenuItem {
    title: string;
    path?: string;
    icon: React.ReactNode;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        path: '/admin',
        icon: <DashboardIcon />,
    },
    {
        title: 'User Management',
        icon: <PeopleIcon />,
        children: [
            { title: 'All Users', path: '/admin/users', icon: <Group /> },
            { title: 'Verifications', path: '/admin/users/verify', icon: <VerifiedUser /> },
        ],
    },
    {
        title: 'Marketplace',
        icon: <StoreIcon />,
        children: [
            { title: 'Listings', path: '/admin/listings', icon: <ShoppingCart /> },
            { title: 'Categories', path: '/admin/categories', icon: <Category /> },
        ],
    },
    {
        title: 'Finance',
        icon: <MoneyIcon />,
        children: [
            { title: 'Transactions', path: '/admin/transactions', icon: <Receipt /> },
            { title: 'Payouts', path: '/admin/payouts', icon: <AccountBalance /> },
        ],
    },
    {
        title: 'System',
        icon: <SettingsIcon />,
        children: [
            { title: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
            { title: 'System Health', path: '/admin/health', icon: <HealthAndSafety /> },
        ],
    },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({
        'User Management': true, // Default open for demo
        'Marketplace': true,
    });

    const handleSubmenuClick = (title: string) => {
        setOpenSubmenus((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const RenderMenuItem = ({ item, isChild = false }: { item: MenuItem; isChild?: boolean }) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openSubmenus[item.title];
        const isSelected = item.path ? location.pathname === item.path : false;

        const handleClick = () => {
            if (hasChildren) {
                handleSubmenuClick(item.title);
            } else if (item.path) {
                handleNavigation(item.path);
            }
        };

        return (
            <>
                <ListItemButton
                    onClick={handleClick}
                    selected={isSelected}
                    sx={{
                        pl: isChild ? 4 : 2,
                        mb: 0.5,
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: isChild ? '0.9rem' : '1rem'
                        }}
                    />
                    {hasChildren ? (isOpen ? <ExpandLess /> : <ExpandMore />) : null}
                </ListItemButton>
                {hasChildren && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children?.map((child) => (
                                <RenderMenuItem key={child.title} item={child} isChild={true} />
                            ))}
                        </List>
                    </Collapse>
                )}
            </>
        );
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                },
            }}
        >
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Placeholder for Logo */}
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    L
                </Box>
                <Typography variant="h6" fontWeight="bold">
                    Livemo Admin
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List component="nav" sx={{ px: 2 }}>
                {menuItems.map((item) => (
                    <RenderMenuItem key={item.title} item={item} />
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
