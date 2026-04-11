import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COLLECTIONS_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const collectionsApi = createApi({
    reducerPath: "collections",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["collections"],
    endpoints: (builder) => ({
        getcollections: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: COLLECTIONS_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: COLLECTIONS_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["collections"],
        }),
        getcollectionsById: builder.query({
            query: (id) => {
                return {
                    url: `${COLLECTIONS_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["collections"],
        }),
        addcollections: builder.mutation({
            query: (payload) => ({
                url: COLLECTIONS_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["collections"],
        }),
        updatecollections: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${COLLECTIONS_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["collections"],
        }),
        deletecollections: builder.mutation({
            query: (id) => ({
                url: `${COLLECTIONS_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["collections"],
        }),
    }),
});

export const {
    useGetcollectionsQuery,
    useGetcollectionsByIdQuery,
    useAddcollectionsMutation,
    useUpdatecollectionsMutation,
    useDeletecollectionsMutation,
} = collectionsApi;

export default collectionsApi;
