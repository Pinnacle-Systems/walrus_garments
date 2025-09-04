import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  MATERIAL_ISSUE_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const MaterialIssueApi = createApi({
  reducerPath: "MaterialIssue",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["MaterialIssue"],
  endpoints: (builder) => ({
    getMaterialIssue: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: MATERIAL_ISSUE_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: MATERIAL_ISSUE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["MaterialIssue"],
    }),
    getMaterialIssueItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${MATERIAL_ISSUE_API}/getPoItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["MaterialIssue"],
    }),
    getMaterialIssueById: builder.query({
      query: (id) => {
        return {
          url: `${MATERIAL_ISSUE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["MaterialIssue"],
    }),
    getMaterialIssueStockValidationById: builder.query({
      query: (id) => {
        return {
          url: `${MATERIAL_ISSUE_API}/stockValidation/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["MaterialIssue"],
    }),

    addMaterialIssue: builder.mutation({
      query: (payload) => ({
        url: MATERIAL_ISSUE_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["MaterialIssue"],
    }),
    updateMaterialIssue: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${MATERIAL_ISSUE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["MaterialIssue"],
    }),
    deleteMaterialIssue: builder.mutation({
      query: (id) => ({
        url: `${MATERIAL_ISSUE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MaterialIssue"],
    }),
  }),
});

export const {
  useGetMaterialIssueQuery,
  useGetMaterialIssueByIdQuery,
  useGetMaterialIssueStockValidationByIdQuery,
  useAddMaterialIssueMutation,
  useUpdateMaterialIssueMutation,
  useDeleteMaterialIssueMutation,
} = MaterialIssueApi;

export default MaterialIssueApi;
