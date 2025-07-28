import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {  REQUIREMENT_FORM_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const RequirementPlanningFormApi = createApi({
  reducerPath: "RequirementPlanningForm",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["RequirementPlanningForm"],
  endpoints: (builder) => ({
    getRequirementPlanningForm: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: REQUIREMENT_FORM_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: REQUIREMENT_FORM_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["RequirementPlanningForm"],
    }),
    getRequirementPlanningFormItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${REQUIREMENT_FORM_API}/getPoItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["RequirementPlanningForm"],
    }),
    getRequirementPlanningFormItemById: builder.query({
      query: ({ id, purchaseInwardId, stockId, storeId, billEntryId, poType }) => {
        return {
          url: `${REQUIREMENT_FORM_API}/getPoItems/${id}/${purchaseInwardId ? purchaseInwardId : null}/${stockId ? stockId : null}/${storeId ? storeId : null}/${billEntryId ? billEntryId : null}/${poType ? poType : null}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["RequirementPlanningForm"],
    }),
    getRequirementPlanningFormById: builder.query({
      query: (id) => {
        return {
          url: `${REQUIREMENT_FORM_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["RequirementPlanningForm"],
    }),
    addRequirementPlanningForm: builder.mutation({
      query: (payload) => ({
        url: REQUIREMENT_FORM_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["RequirementPlanningForm"],
    }),
    updateRequirementPlanningForm: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${REQUIREMENT_FORM_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["RequirementPlanningForm"],
    }),
    deleteRequirementPlanningForm: builder.mutation({
      query: (id) => ({
        url: `${REQUIREMENT_FORM_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["po"],
    }),
  }),
});

export const {
  useGetRequirementPlanningFormQuery,
  useGetRequirementPlanningFormByIdQuery,
  useGetRequirementPlanningFormItemsQuery,
  useGetRequirementPlanningFormItemByIdQuery,
  useAddRequirementPlanningFormMutation,
  useUpdateRequirementPlanningFormMutation,
  useDeleteRequirementPlanningFormMutation,
} = RequirementPlanningFormApi;

export default RequirementPlanningFormApi;
