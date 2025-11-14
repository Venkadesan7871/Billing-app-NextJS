import { configureStore } from "@reduxjs/toolkit";
import {Reducer} from "../localstore/localstore";

export const store = configureStore({
    reducer: {
        state: Reducer,
    },
});