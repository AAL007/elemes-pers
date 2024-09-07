
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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import React from 'react';
import { fetchLecturerToDoList } from '@/app/api/home/dashboard';

const LecturerToDoList = () => {
    const [toDoList, setToDoList] = React.useState<{Description: string, Deadline: number}[]>([]);
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.user);
    
    useEffect(() => {
        dispatch(loadUserFromStorage())
        const toDoList = async () => {
            const res = await fetchLecturerToDoList(userData.id);
            if (!res.success) {
                alert(res.message);
            }
            setToDoList(res.data as { Description: string, Deadline: number}[]);
        };
        toDoList();
    }, [dispatch]);
    return (

        <DashboardCard title="To Do List">
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
