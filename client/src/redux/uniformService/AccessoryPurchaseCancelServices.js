import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  ACCESSORT_PURCHASE_CANCEL_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryPurchaseCancelApi = createApi({
    reducerPath: "AccessoryPurchaseCancel",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["AccessoryPurchaseCancel"],
    endpoints: (builder) => ({
        getAccessoryPurchaseCancel: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: ACCESSORT_PURCHASE_CANCEL_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: ACCESSORT_PURCHASE_CANCEL_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["AccessoryPurchaseCancel"],
        }),
        getAccessoryPurchaseCancelById: builder.query({
            query: (id) => {
                return {
                    url: `${ACCESSORT_PURCHASE_CANCEL_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["AccessoryPurchaseCancel"],
        }),
        getDirectItems: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ACCESSORT_PURCHASE_CANCEL_API}/getDirectItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["AccessoryPurchaseCancel"],
        }),
        getPoItemsandDirectInwardItems: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ACCESSORT_PURCHASE_CANCEL_API}/getPoItemsandDirectInwardItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["AccessoryPurchaseCancel"],
        }),
        getDirectItemById: builder.query({
            query: ({ id, purchaseInwardId, stockId, storeId, billEntryId }) => {
                return {
                    url: `${ACCESSORT_PURCHASE_CANCEL_API}/getDirectItems/${id}/${purchaseInwardId ? purchaseInwardId : null}/${stockId ? stockId : null}/${storeId ? storeId : null}/${billEntryId ? billEntryId : null}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["AccessoryPurchaseCancel"],
        }),

        addAccessoryPurchaseCancel: builder.mutation({
            query: (payload) => ({
                url: ACCESSORT_PURCHASE_CANCEL_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["AccessoryPurchaseCancel"],
        }),
        updateAccessoryPurchaseCancel: builder.mutation({
            query: ({ id, ...body }) => {
                return {
                    url: `${ACCESSORT_PURCHASE_CANCEL_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["AccessoryPurchaseCancel"],
        }),
        deleteAccessoryPurchaseCancel: builder.mutation({
            query: (id) => ({
                url: `${ACCESSORT_PURCHASE_CANCEL_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["AccessoryPurchaseCancel"],
        }),
    }),
});

export const {
    useGetAccessoryPurchaseCancelQuery,
    useGetAccessoryPurchaseCancelByIdQuery,
    useGetPoItemsandDirectInwardItemsQuery,
    useGetDirectItemsQuery,
    useGetDirectItemByIdQuery,
    useAddAccessoryPurchaseCancelMutation,
    useUpdateAccessoryPurchaseCancelMutation,
    useDeleteAccessoryPurchaseCancelMutation,
} = AccessoryPurchaseCancelApi;

export default AccessoryPurchaseCancelApi;
