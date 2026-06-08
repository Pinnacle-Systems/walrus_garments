import * as React from 'react';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { push } from '../../redux/features/opentabs';
import { useState, useMemo } from 'react';
import { useGetUsersQuery } from '../../redux/service/user';

const Accordion = styled(MuiAccordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'transparent',
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&::before': {
        display: 'none',
    },
}));

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(2),
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    border: '1px solid #ccc',
}));

const CustomizedAccordions = () => {
    const [expanded, setExpanded] = useState('');
    const dispatch = useDispatch();

    const { data: userData } = useGetUsersQuery();
    const storedUsername = localStorage.getItem('userName');

    const currentUser = useMemo(() => {
        return userData?.data?.find(user => user.userName === storedUsername);
    }, [userData, storedUsername]);

    const userRoles = useMemo(() => {
        return currentUser
            ? userData.data.filter(user => user.userName === storedUsername && user.role).map(user => user.role)
            : [];
    }, [currentUser, userData, storedUsername]);

    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    return (
        <div className='w-full flex flex-col items-center justify-center'>
            <div className='w-full p-2'>
                {userRoles.includes('DASHBOARD') && (
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '1rem', color: 'white' }} />}
                            sx={{
                                bgcolor: 'black',
                                color: 'white',
                            }}
                        >
                            <button
                                className='w-full flex items-center gap-3'
                                onClick={() => dispatch(push({ id: 1, name: 'DASHBOARD' }))}
                            >
                                <DashboardIcon sx={{ color: '#CA8A04' }} />
                                <span className='text-[16px] font-semibold'>DASHBOARD</span>
                            </button>
                        </AccordionSummary>
                    </Accordion>
                )}

                {userRoles.includes('Employess') && (
                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                            sx={{ bgcolor: '#263238', color: 'white' }}
                        >
                            <PeopleIcon sx={{ color: '#29b6f6' }} />
                            <Typography sx={{ marginLeft: 2 }}>Employees</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography
                                className='cursor-pointer pl-9'
                                onClick={() => dispatch(push({ id: 3, name: 'Employee Details' }))}
                            >
                                Employee Details
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                )}

                {userRoles.includes('User') && (
                    <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                            sx={{ bgcolor: '#37474f', color: 'white' }}
                        >
                            <PersonIcon sx={{ color: '#CA8A04' }} />
                            <Typography sx={{ marginLeft: 2 }}>User</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography
                                className='cursor-pointer pl-9 text-white'
                                onClick={() => dispatch(push({ id: 4, name: 'User' }))}
                            >
                                User Details
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                )}
            </div>
        </div>
    );
};

export default CustomizedAccordions;
