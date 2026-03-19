import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_DELIVERY_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const salesDeliveryApi = createApi({
    reducerPath: "salesDelivery",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["salesDelivery"],
    endpoints: (builder) => ({
        getSalesDeliveryMaster: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SALES_DELIVERY_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SALES_DELIVERY_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["salesDelivery"],
        }),
        getSalesDeliveryMasterById: builder.query({
            query: (id) => {
                return {
                    url: `${SALES_DELIVERY_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["salesDelivery"],
        }),
        addSalesDeliveryMaster: builder.mutation({
            query: (payload) => ({
                url: SALES_DELIVERY_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["salesDelivery"],
        }),
        updateSalesDeliveryMaster: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${SALES_DELIVERY_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["salesDelivery"],
        }),
        deleteSalesDeliveryMaster: builder.mutation({
            query: (id) => ({
                url: `${SALES_DELIVERY_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["salesDelivery"],
        }),
    }),
});

export const {
    useGetSalesDeliveryMasterQuery,
    useGetSalesDeliveryMasterByIdQuery,
    useAddSalesDeliveryMasterMutation,
    useUpdateSalesDeliveryMasterMutation,
    useDeleteSalesDeliveryMasterMutation,
} = salesDeliveryApi;

export default salesDeliveryApi;
