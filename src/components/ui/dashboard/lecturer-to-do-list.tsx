
import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import DashboardCard from './dashboard-card';
import { useEffect } from 'react';
import React from 'react';
import { fetchLecturerToDoList, fetchStudentToDoList } from '@/app/api/home/dashboard';

const LecturerToDoList = ({userId, userRole} : {userId: string, userRole: string}) => {
    const [toDoList, setToDoList] = React.useState<{Description: string, Deadline: number}[]>([]);
    
    useEffect(() => {
        const toDoList = async () => {
            const res = userRole == 'Lecturer' ? await fetchLecturerToDoList(userId) : await fetchStudentToDoList(userId);
            if (!res.success) {
                alert(res.message);
            }
            setToDoList(res.data as { Description: string, Deadline: number}[]);
        };
        toDoList();
    }, [userId, userRole]);

    return (
        <DashboardCard contentPadding='30px' title="To Do List">
            <Box component="div" sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
                <Table
                    aria-label="simple table"
                    sx={{
                        whiteSpace: "nowrap",
                        mt: 2
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    No
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Description
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Deadline
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {toDoList.map((list, index) => {
                            index++
                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {index}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "400",
                                            }}
                                        >
                                            {list.Description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "400",
                                            }}
                                        >
                                            {list.Deadline}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Box>
        </DashboardCard>
    );
};

export default LecturerToDoList;
