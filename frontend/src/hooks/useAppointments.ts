import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';

export const useAppointments = (skip = 0, limit = 50, status?: string, customerId?: string) => {
  return useQuery({
    queryKey: ['appointments', skip, limit, status, customerId],
    queryFn: () => apiClient.getAppointments(skip, limit, status, customerId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAppointment = (appointmentId: string | null) => {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => apiClient.getAppointment(appointmentId!),
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: string; data: any }) =>
      apiClient.updateAppointment(appointmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason: string }) =>
      apiClient.cancelAppointment(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => apiClient.confirmAppointment(appointmentId),
    onSuccess: (_, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] });
    },
  });
};

export const useAvailableSlots = (staffId: string, date: string | null) => {
  return useQuery({
    queryKey: ['available-slots', staffId, date],
    queryFn: () => apiClient.getAvailableSlots(staffId, date!, 60),
    enabled: !!date,
    staleTime: 5 * 60 * 1000,
  });
};
