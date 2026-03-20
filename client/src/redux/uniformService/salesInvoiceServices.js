import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_INVOICE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const salesInvoiceApi = createApi({
    reducerPath: "salesInvoice",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["salesInvoice"],
    endpoints: (builder) => ({
        getSalesInvoice: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SALES_INVOICE_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SALES_INVOICE_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["salesInvoice"],
        }),
        getSalesInvoiceById: builder.query({
            query: (id) => {
                return {
                    url: `${SALES_INVOICE_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["salesInvoice"],
        }),
        addSalesInvoice: builder.mutation({
            query: (payload) => ({
                url: SALES_INVOICE_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["salesInvoice"],
        }),
        updateSalesInvoice: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${SALES_INVOICE_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["salesInvoice"],
        }),
        deleteSalesInvoice: builder.mutation({
            query: (id) => ({
                url: `${SALES_INVOICE_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["salesInvoice"],
        }),
    }),
});

export const {
    useGetSalesInvoiceQuery,
    useGetSalesInvoiceByIdQuery,
    useAddSalesInvoiceMutation,
    useUpdateSalesInvoiceMutation,
    useDeleteSalesInvoiceMutation,
} = salesInvoiceApi;

export default salesInvoiceApi;
