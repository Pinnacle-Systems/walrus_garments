import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EXPENSE_MASTER } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ExpenseMasterApi = createApi({
    reducerPath: "ExpenseMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ExpenseMaster"],
    endpoints: (builder) => ({
        getExpenseMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: EXPENSE_MASTER + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: EXPENSE_MASTER,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ExpenseMaster"],
        }),
        getExpenseMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${EXPENSE_MASTER}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ExpenseMaster"],
        }),
        addExpenseMaster: builder.mutation({
            query: (payload) => ({
                url: EXPENSE_MASTER,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ExpenseMaster"],
        }),
        updateExpenseMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${EXPENSE_MASTER}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ExpenseMaster"],
        }),
        deleteExpenseMaster: builder.mutation({
            query: (id) => ({
                url: `${EXPENSE_MASTER}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ExpenseMaster"],
        }),
    }),
});

export const {
    useGetExpenseMasterQuery,
    useGetExpenseMasterByIdQuery,
    useAddExpenseMasterMutation,
    useUpdateExpenseMasterMutation,
    useDeleteExpenseMasterMutation,
} = ExpenseMasterApi;

export default ExpenseMasterApi;
