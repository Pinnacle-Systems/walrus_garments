import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EXCESSTOLERANCEAPI } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const ExcessToleranceMasterApi = createApi({
    reducerPath: "ExcessToleranceMaster",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["ExcessToleranceMaster"],
    endpoints: (builder) => ({
        getExcessTolerance: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: EXCESSTOLERANCEAPI + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: EXCESSTOLERANCEAPI,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ExcessToleranceMaster"],
        }),
        getExcessToleranceById: builder.query({
            query: (id) => {
                return {
                    url: `${EXCESSTOLERANCEAPI}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["ExcessToleranceMaster"],
        }),
        getExcessToleranceItems: builder.query({
            query: ({ params }) => {
                return {
                    url: `${EXCESSTOLERANCEAPI}/getExcessToleranceItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ExcessToleranceMaster"],
        }),
        getToleranceItems: builder.query({
            query: ({ params }) => {
                return {
                    url: `${EXCESSTOLERANCEAPI}/getToleranceItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["ExcessToleranceMaster"],
        }),
        addExcessTolerance: builder.mutation({
            query: (payload) => ({
                url: EXCESSTOLERANCEAPI,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["ExcessToleranceMaster"],
        }),
        updateExcessTolerance: builder.mutation({
            query: (payload) => {
                const { id, ...body } = payload;
                return {
                    url: `${EXCESSTOLERANCEAPI}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["ExcessToleranceMaster"],
        }),
        deleteExcessTolerance: builder.mutation({
            query: (id) => ({
                url: `${EXCESSTOLERANCEAPI}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ExcessToleranceMaster"],
        }),
    }),
});

export const {
    useGetExcessToleranceQuery,
    useGetExcessToleranceByIdQuery,
    useGetExcessToleranceItemsQuery,
    useLazyGetExcessToleranceItemsQuery,
    useAddExcessToleranceMutation,
    useUpdateExcessToleranceMutation,
    useDeleteExcessToleranceMutation,
} = ExcessToleranceMasterApi;

export default ExcessToleranceMasterApi;

