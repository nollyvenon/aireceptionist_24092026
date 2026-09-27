import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const services = [
    { id: '1', name: 'Consultation', duration: 30, price: 50 },
    { id: '2', name: 'Follow-up', duration: 15, price: 30 },
    { id: '3', name: 'Full Service', duration: 60, price: 100 },
    { id: '4', name: 'Premium Package', duration: 90, price: 150 },
  ];

  const staffMembers = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Davis' },
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];

  const handleBookAppointment = async () => {
    if (!customerName || !customerEmail || !customerPhone || !selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          service_id: selectedService,
          staff_id: selectedStaff,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          notes,
        }),
      });

      if (response.ok) {
        alert('Appointment booked successfully!');
        // Reset form
        setStep(1);
        setSelectedService('');
        setSelectedStaff('');
        setSelectedDate('');
        setSelectedTime('');
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setNotes('');
      } else {
        alert('Failed to book appointment');
      }
    } catch (err) {
      alert('An error occurred while booking the appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedServiceDetails = services.find(s => s.id === selectedService);

  return (
    <MainLayout title="Book Appointment">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Book an Appointment</h1>
          <p className="text-sm text-on-surface-variant">
            Step {step} of 4
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="p-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex-1">
                <div
                  className={`h-2 rounded-full ${
                    s <= step ? 'bg-primary-600' : 'bg-surface-container'
                  }`}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-on-surface mb-6">Select Service</h2>
            <div className="space-y-3 mb-6">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedService === service.id
                      ? 'border-primary-600 bg-primary-container'
                      : 'border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-on-surface">{service.name}</p>
                      <p className="text-sm text-on-surface-variant">{service.duration} minutes</p>
                    </div>
                    <p className="text-lg font-bold text-on-surface">${service.price}</p>
                  </div>
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              disabled={!selectedService}
              className="w-full"
            >
              Continue to Staff Selection
            </Button>
          </Card>
        )}

        {/* Step 2: Select Staff */}
        {step === 2 && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-on-surface mb-6">Select Staff Member</h2>
            <div className="space-y-3 mb-6">
              {staffMembers.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => setSelectedStaff(staff.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedStaff === staff.id
                      ? 'border-primary-600 bg-primary-container'
                      : 'border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  <p className="font-semibold text-on-surface">{staff.name}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                disabled={!selectedStaff}
                className="flex-1"
              >
                Continue to Date
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-on-surface mb-6">Select Date & Time</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg border text-sm font-medium ${
                        selectedTime === time
                          ? 'border-primary-600 bg-primary-container text-on-surface'
                          : 'border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(4)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1"
              >
                Continue to Details
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Customer Details */}
        {step === 4 && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-on-surface mb-6">Your Details</h2>
            <div className="space-y-4 mb-6">
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name *"
              />
              <Input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email Address *"
                type="email"
              />
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone Number *"
              />
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements or notes..."
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface"
                  rows={4}
                />
              </div>
            </div>

            {/* Summary */}
            <Card className="p-4 bg-primary-container/10 mb-6">
              <p className="text-sm font-semibold text-on-surface mb-2">Appointment Summary:</p>
              <div className="text-xs text-on-surface-variant space-y-1">
                <p>Service: {selectedServiceDetails?.name} ({selectedServiceDetails?.duration}min)</p>
                <p>Staff: {staffMembers.find(s => s.id === selectedStaff)?.name}</p>
                <p>Date & Time: {selectedDate} at {selectedTime}</p>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleBookAppointment}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
