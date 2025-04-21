import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SOCKS_MATERIAL_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const SocksMaterialApi = createApi({
    reducerPath: "socksMaterial",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["SocksMaterial"],
    endpoints: (builder) => ({
        getSocksMaterial: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: SOCKS_MATERIAL_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: SOCKS_MATERIAL_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["SocksMaterial"],
        }),
        getSocksMaterialById: builder.query({
            query: (id) => {
                return {
                    url: `${SOCKS_MATERIAL_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["SocksMaterial"],
        }),
        addSocksMaterial: builder.mutation({
            query: (payload) => ({
                url: SOCKS_MATERIAL_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["SocksMaterial"],
        }),
        updateSocksMaterial: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${SOCKS_MATERIAL_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["SocksMaterial"],
        }),
        deleteSocksMaterial: builder.mutation({
            query: (id) => ({
                url: `${SOCKS_MATERIAL_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["SocksMaterial"],
        }),
    }),
});

export const {
    useGetSocksMaterialQuery,
    useGetSocksMaterialByIdQuery,
    useAddSocksMaterialMutation,
    useUpdateSocksMaterialMutation,
    useDeleteSocksMaterialMutation,
} = SocksMaterialApi;

export default SocksMaterialApi;
