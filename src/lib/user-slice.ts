import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface userState {
    id: string;
    name: string;
    email: string;
    role: string;
    roleCategory: string;
}

const initialState: userState = {
    id: "",
    name: "",
    email: "",
    role: "",
    roleCategory: ""
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData(state, action: PayloadAction<userState>){
            // console.log(action.payload);
            // console.log(action)
            // console.log(state)
            state.id = action.payload.id;
            state.email = action.payload.email;
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.roleCategory = action.payload.roleCategory;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        loadUserFromStorage: (state) => {
            const user = JSON.parse(localStorage.getItem('user') as string);
            if (user) {
              state.id = user.id;
              state.name = user.name;
              state.email = user.email;
              state.role = user.role;
              state.roleCategory = user.roleCategory;
            }
          },
          clearUser: (state) => {
            state.id = '';
            state.name = '';
            state.email = '';
            state.role = '';
            state.roleCategory = '';
            // Clear from local storage
            localStorage.removeItem('user');
          },
    }
})

export const { setUserData, loadUserFromStorage, clearUser } = userSlice.actions;
export default userSlice.reducer;