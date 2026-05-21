import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { POINT_OF_SALES } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const pointOfSalesApi = createApi({
    reducerPath: "pointOfSales",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["pointOfSales"],
    endpoints: (builder) => ({
        getPointOfSales: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: POINT_OF_SALES + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: POINT_OF_SALES,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["pointOfSales"],
        }),
        getPointOfSalesById: builder.query({
            query: (id) => {
                return {
                    url: `${POINT_OF_SALES}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["pointOfSales"],
        }),
        addPointOfSales: builder.mutation({
            query: (payload) => ({
                url: POINT_OF_SALES,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["pointOfSales"],
        }),
        requestDiscount: builder.mutation({
            query: (payload) => ({
                url: `${POINT_OF_SALES}/request-discount`,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["pointOfSales"],
        }),
        approveDiscount: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${POINT_OF_SALES}/approve-discount/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["pointOfSales"],
        }),
        updatePointOfSales: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${POINT_OF_SALES}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["pointOfSales"],
        }),
        deletePointOfSales: builder.mutation({
            query: (id) => ({
                url: `${POINT_OF_SALES}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["pointOfSales"],
        }),
        cancelPointOfSales: builder.mutation({
            query: (id) => ({
                url: `${POINT_OF_SALES}/cancel/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["pointOfSales"],
        }),
        checkReferenceNumber: builder.query({
            query: (refNo) => ({
                url: `${POINT_OF_SALES}/check-ref`,
                method: "GET",
                params: { refNo }
            })
        }),
        getPartyCreditBalance: builder.query({
            query: (partyId) => ({
                url: `${POINT_OF_SALES}/credit-balance`,
                method: "GET",
                params: { partyId }
            })
        }),
    }),
});

export const {
    useGetPointOfSalesQuery,
    useLazyGetPointOfSalesQuery,
    useGetPointOfSalesByIdQuery,
    useLazyGetPointOfSalesByIdQuery,
    useAddPointOfSalesMutation,
    useUpdatePointOfSalesMutation,
    useDeletePointOfSalesMutation,
    useCancelPointOfSalesMutation,
    useLazyCheckReferenceNumberQuery,
    useLazyGetPartyCreditBalanceQuery,
    useRequestDiscountMutation,
    useApproveDiscountMutation
} = pointOfSalesApi;

export default pointOfSalesApi;
