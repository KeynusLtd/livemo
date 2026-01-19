import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, InputBase, Box, Avatar, Badge } from '@mui/material';
import { Search as SearchIcon, Notifications, Menu as MenuIcon } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const drawerWidth = 280;

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.05),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.black, 0.08),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '40ch',
        },
    },
}));

const Header = () => {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 'none',
                borderBottom: '1px solid #E5E7EB',
            }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                    Dashboard
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Search>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search anything..."
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </Search>

                <IconButton size="large" color="inherit">
                    <Badge badgeContent={4} color="error">
                        <Notifications />
                    </Badge>
                </IconButton>

                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar alt="Admin User" src="/static/images/avatar/1.jpg" sx={{ bgcolor: 'primary.main' }}>
                        A
                    </Avatar>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Admin User
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Super Admin
                        </Typography>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
