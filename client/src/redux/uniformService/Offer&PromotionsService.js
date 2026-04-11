import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OFFERS_PROMOTIONS } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const offersPromotionsApi = createApi({
    reducerPath: "offersPromotions",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["offersPromotions"],
    endpoints: (builder) => ({
        getoffersPromotions: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: OFFERS_PROMOTIONS + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: OFFERS_PROMOTIONS,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["offersPromotions"],
        }),
        getoffersPromotionsById: builder.query({
            query: (id) => {
                return {
                    url: `${OFFERS_PROMOTIONS}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["offersPromotions"],
        }),
        addoffersPromotions: builder.mutation({
            query: (payload) => ({
                url: OFFERS_PROMOTIONS,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["offersPromotions"],
        }),
        updateoffersPromotions: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${OFFERS_PROMOTIONS}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["offersPromotions"],
        }),
        deleteoffersPromotions: builder.mutation({
            query: (id) => ({
                url: `${OFFERS_PROMOTIONS}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["offersPromotions"],
        }),
    }),
});

export const {
    useGetoffersPromotionsQuery,
    useGetoffersPromotionsByIdQuery,
    useAddoffersPromotionsMutation,
    useUpdateoffersPromotionsMutation,
    useDeleteoffersPromotionsMutation,
} = offersPromotionsApi;

export default offersPromotionsApi;
