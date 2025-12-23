import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  ACCESSORY_TEMPLATE_API} from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const AccessoryTemplateMasterApi = createApi({
  reducerPath: "accessoryTemplateMaster",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["accessoryTemplateMaster"],
  endpoints: (builder) => ({
    getAccessoryTemplateMaster: builder.query({
      query: ({params, searchParams}) => {
        if(searchParams){
          return {
            url: ACCESSORY_TEMPLATE_API +"/search/"+searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: ACCESSORY_TEMPLATE_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["accessoryTemplateMaster"],
    }),
    getAccessoryTemplateMasterById: builder.query({
      query: (id) => {
        return {
          url: `${ACCESSORY_TEMPLATE_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["accessoryTemplateMaster"],
    }),
    addAccessoryTemplateMaster: builder.mutation({
      query: (payload) => ({
        url: ACCESSORY_TEMPLATE_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["accessoryTemplateMaster"],
    }),
    updateAccessoryTemplateMaster: builder.mutation({
      query: (payload) => {
        const { id, ...body } = payload;
        return {
          url: `${ACCESSORY_TEMPLATE_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["accessoryTemplateMaster"],
    }),
    deleteAccessoryTemplateMaster: builder.mutation({
      query: (id) => ({
        url: `${ACCESSORY_TEMPLATE_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["accessoryTemplateMaster"],
    }),
  }),
});

export const {
  useGetAccessoryTemplateMasterQuery,
  useGetAccessoryTemplateMasterByIdQuery,
  useAddAccessoryTemplateMasterMutation,
  useUpdateAccessoryTemplateMasterMutation,
  useDeleteAccessoryTemplateMasterMutation,
} = AccessoryTemplateMasterApi;

export default AccessoryTemplateMasterApi;
