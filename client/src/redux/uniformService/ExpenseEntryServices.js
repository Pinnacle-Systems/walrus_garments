import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EXPENSE_ENTRY } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ExpenseEntryApi = createApi({
    reducerPath: "ExpenseEntry",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ExpenseEntry"],
    endpoints: (builder) => ({
        getExpenseEntry: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: EXPENSE_ENTRY + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: EXPENSE_ENTRY,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ExpenseEntry"],
        }),
        getExpenseEntryById: builder.query({
            query: (id) => {
                return {
                    url: `${EXPENSE_ENTRY}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ExpenseEntry"],
        }),
        addExpenseEntry: builder.mutation({
            query: (payload) => ({
                url: EXPENSE_ENTRY,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ExpenseEntry"],
        }),
        updateExpenseEntry: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${EXPENSE_ENTRY}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ExpenseEntry"],
        }),
        deleteExpenseEntry: builder.mutation({
            query: (id) => ({
                url: `${EXPENSE_ENTRY}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ExpenseEntry"],
        }),
    }),
});

export const {
    useGetExpenseEntryQuery,
    useGetExpenseEntryByIdQuery,
    useAddExpenseEntryMutation,
    useUpdateExpenseEntryMutation,
    useDeleteExpenseEntryMutation,
} = ExpenseEntryApi;

export default ExpenseEntryApi;
