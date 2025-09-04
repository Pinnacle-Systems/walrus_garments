import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RAISE_INDENET_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const RaiseIndentApi = createApi({
  reducerPath: "RaiseIndent",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["RaiseIndent"],
  endpoints: (builder) => ({
    getRaiseIndent: builder.query({
      query: ({ params, searchParams }) => {
        if (searchParams) {
          return {
            url: RAISE_INDENET_API + "/search/" + searchParams,
            method: "GET",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            params
          };
        }
        return {
          url: RAISE_INDENET_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["RaiseIndent"],
    }),
    getRaiseIndentItems: builder.query({
      query: ({ params }) => {
        return {
          url: `${RAISE_INDENET_API}/getPoItems`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params
        };
      },
      providesTags: ["RaiseIndent"],
    }),
    getRaiseIndentById: builder.query({
      query: (id) => {
        return {
          url: `${RAISE_INDENET_API}/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["RaiseIndent"],
    }),
    getRaiseIndentStockValidationById: builder.query({
      query: (id) => {
        return {
          url: `${RAISE_INDENET_API}/stockValidation/${id}`,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["RaiseIndent"],
    }),

    addRaiseIndent: builder.mutation({
      query: (payload) => ({
        url: RAISE_INDENET_API,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["RaiseIndent"],
    }),
    updateRaiseIndent: builder.mutation({
      query: ({ id, ...body }) => {
        return {
          url: `${RAISE_INDENET_API}/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["RaiseIndent"],
    }),
    deleteRaiseIndent: builder.mutation({
      query: (id) => ({
        url: `${RAISE_INDENET_API}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RaiseIndent"],
    }),
  }),
});

export const {
  useGetRaiseIndentQuery,
  useGetRaiseIndentByIdQuery,
  useGetRaiseIndentStockValidationByIdQuery,
  useAddRaiseIndentMutation,
  useUpdateRaiseIndentMutation,
  useDeleteRaiseIndentMutation,
} = RaiseIndentApi;

export default RaiseIndentApi;
