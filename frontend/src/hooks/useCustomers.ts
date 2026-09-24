import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';

export const useCustomers = (skip = 0, limit = 50, status?: string) => {
  return useQuery({
    queryKey: ['customers', skip, limit, status],
    queryFn: () => apiClient.getCustomers(skip, limit, status),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCustomer = (customerId: string | null) => {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => apiClient.getCustomer(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: any }) =>
      apiClient.updateCustomer(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
    },
  });
};

export const useSearchCustomers = (query: string) => {
  return useQuery({
    queryKey: ['customers-search', query],
    queryFn: () => apiClient.searchCustomers(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLeadScore = (customerId: string) => {
  return useQuery({
    queryKey: ['lead-score', customerId],
    queryFn: () => apiClient.getLeadScore(customerId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
