import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  ACCESSORY_CATEGORY_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryCategoryMasterApi = createApi({
  reducerPath: "accessoryCategoryMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["accessoryCategoryMaster"],
  endpoints: (builder) => ({
    getAccessoryCategoryMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: ACCESSORY_CATEGORY_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ACCESSORY_CATEGORY_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["accessoryCategoryMaster"],
    }),
    getAccessoryCategoryMasterById: builder.query({
      query: (id) => {
        return {
          url: `${ACCESSORY_CATEGORY_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["accessoryCategoryMaster"],
    }),
    addAccessoryCategoryMaster: builder.mutation({
      query: (payload) => ({
        url: ACCESSORY_CATEGORY_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["accessoryCategoryMaster"],
    }),
    updateAccessoryCategoryMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${ACCESSORY_CATEGORY_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["accessoryCategoryMaster"],
    }),
    deleteAccessoryCategoryMaster: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORY_CATEGORY_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["accessoryCategoryMaster"],
    }),
  }),
});

export const {
  useGetAccessoryCategoryMasterQuery,
  useGetAccessoryCategoryMasterByIdQuery,
  useAddAccessoryCategoryMasterMutation,
  useUpdateAccessoryCategoryMasterMutation,
  useDeleteAccessoryCategoryMasterMutation,
} = AccessoryCategoryMasterApi;

export default AccessoryCategoryMasterApi;
