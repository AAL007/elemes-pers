
import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import DashboardCard from './dashboard-card';
import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { loadUserFromStorage } from "@/lib/user-slice";
import React from 'react';
import { fetchToDoList } from '@/app/api/home/dashboard';

// const products = [
//     {
//         id: "1",
//         name: "Sunil Joshi",
//         post: "Web Designer",
//         pname: "Elite Admin",
//         priority: "Low",
//         pbg: "primary.main",
//         budget: "3.9",
//     },
//     {
//         id: "2",
//         name: "Andrew McDownland",
//         post: "Project Manager",
//         pname: "Real Homes WP Theme",
//         priority: "Medium",
//         pbg: "secondary.main",
//         budget: "24.5",
//     },
//     {
//         id: "3",
//         name: "Christopher Jamil",
//         post: "Project Manager",
//         pname: "MedicalPro WP Theme",
//         priority: "High",
//         pbg: "error.main",
//         budget: "12.8",
//     },
//     {
//         id: "4",
//         name: "Nirav Joshi",
//         post: "Frontend Engineer",
//         pname: "Hosting Press HTML",
//         priority: "Critical",
//         pbg: "success.main",
//         budget: "2.4",
//     },
// ];


const ToDoList = () => {
    const [toDoList, setToDoList] = React.useState<{message: string, quantity: number, deadline: string}[]>([]);
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.user);
    
    useEffect(() => {
        dispatch(loadUserFromStorage())
        const toDoList = async () => {
            const res = await fetchToDoList();
            if (!res.success) {
                alert(res.message);
            }
            // console.log(res.data)
            let filteredData = res.data.filter(item => item != "");
            // console.log(filteredData)
            setToDoList(filteredData as { message: string, quantity: number, deadline: string }[]);
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
                                    Remains
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Deadline
                                </Typography>
                            </TableCell>
                            {/* <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Priority
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Budget
                                </Typography>
                            </TableCell> */}
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
                                            {list.message}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "400",
                                            }}
                                        >
                                            {list.quantity}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "400",
                                            }}
                                        >
                                            {list.deadline}
                                        </Typography>
                                    </TableCell>
                                    {/* <TableCell>
                                        <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                                            {product.pname}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            sx={{
                                                px: "4px",
                                                backgroundColor: product.pbg,
                                                color: "#fff",
                                            }}
                                            size="small"
                                            label={product.priority}
                                        ></Chip>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="h6">${product.budget}k</Typography>
                                    </TableCell> */}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Box>
        </DashboardCard>
    );
};

export default ToDoList;
