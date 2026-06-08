import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALE_ORDER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const saleOrderApi = createApi({
    reducerPath: "saleOrder",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["saleOrder"],
    endpoints: (builder) => ({
        getsaleOrder: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SALE_ORDER_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SALE_ORDER_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["saleOrder"],
        }),
        getsaleOrderById: builder.query({
            query: (id) => {
                return {
                    url: `${SALE_ORDER_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["saleOrder"],
        }),
        addsaleOrder: builder.mutation({
            query: (payload) => ({
                url: SALE_ORDER_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["saleOrder"],
        }),
        updatesaleOrder: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${SALE_ORDER_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["saleOrder"],
        }),
        deletesaleOrder: builder.mutation({
            query: (id) => ({
                url: `${SALE_ORDER_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["saleOrder"],
        }),
    }),
});

export const {
    useGetsaleOrderQuery,
    useGetsaleOrderByIdQuery,
    useAddsaleOrderMutation,
    useUpdatesaleOrderMutation,
    useDeletesaleOrderMutation,
} = saleOrderApi;

export default saleOrderApi;
