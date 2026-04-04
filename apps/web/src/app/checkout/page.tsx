'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  MapPin,
  Truck,
  Store,
  Check,
  Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button, Card, Modal } from '@/components/ui';
import { AddressForm } from '@/components/profile/AddressForm';
import { AuthGuard } from '@/components/auth-guard';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { userApi, ordersApi, settingsApi } from '@/lib/api';
import { formatPrice, formatDateForAPI, cn } from '@/lib/utils';
import type { DeliveryType, PaymentMethod } from '@/types';

const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'PAYME', label: 'Payme', icon: '💳' },
  { value: 'CLICK', label: 'Click', icon: '📱' },
  { value: 'UZUM', label: 'Uzum', icon: '💰' },
];

function CheckoutPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, totalSavings, deliveryFee, total, setDeliveryFee, clearCart } =
    useCartStore();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAYME');
  const [notes, setNotes] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    } else if (items.length === 0) {
      router.push('/cart');
    }
  }, [isAuthenticated, items.length, router]);

  // Fetch addresses
  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: userApi.getAddresses,
    enabled: isAuthenticated,
  });

  // Fetch business settings for self-pickup address
  const { data: businessSettings } = useQuery({
    queryKey: ['businessSettings'],
    queryFn: () => settingsApi.getBusinessInfo().then((res) => res.settings),
  });

  // Set default address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  // Update delivery fee based on delivery type
  useEffect(() => {
    if (deliveryType === 'SELF_PICKUP') {
      setDeliveryFee(0);
    } else {
      // TODO: Calculate based on address zone
      setDeliveryFee(0); // Free delivery in Tashkent
    }
  }, [deliveryType, setDeliveryFee]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (order) => {
      clearCart();
      toast.success('Заказ успешно оформлен!');
      router.push(`/orders/${order.id}`);
    },
    onError: () => {
      toast.error('Не удалось оформить заказ. Попробуйте позже.');
    },
  });

  const handleSubmit = () => {
    if (deliveryType === 'DELIVERY' && !selectedAddressId) {
      toast.error('Выберите адрес доставки');
      return;
    }

    // Get rental dates from first cart item (assuming all items have same dates)
    const firstItem = items[0];
    if (!firstItem) return;

    createOrderMutation.mutate({
      items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      rental_start_date: formatDateForAPI(new Date(firstItem.rentalStartDate)),
      rental_end_date: formatDateForAPI(new Date(firstItem.rentalEndDate)),
      delivery_type: deliveryType,
      delivery_address_id: deliveryType === 'DELIVERY' ? selectedAddressId || undefined : undefined,
      payment_method: paymentMethod,
      notes: notes || undefined,
    });
  };

  const handleAddressCreated = () => {
    refetchAddresses();
    setShowAddressModal(false);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Оформление заказа
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-semibold text-lg mb-4">Способ получения</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType('DELIVERY')}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                  deliveryType === 'DELIVERY'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center',
                    deliveryType === 'DELIVERY' ? 'bg-primary text-white' : 'bg-muted'
                  )}
                >
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Доставка</p>
                  <p className="text-sm text-muted-foreground">Курьером на адрес</p>
                </div>
                {deliveryType === 'DELIVERY' && (
                  <Check className="h-5 w-5 text-primary ml-auto" />
                )}
              </button>

              <button
                onClick={() => setDeliveryType('SELF_PICKUP')}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                  deliveryType === 'SELF_PICKUP'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center',
                    deliveryType === 'SELF_PICKUP' ? 'bg-primary text-white' : 'bg-muted'
                  )}
                >
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Самовывоз</p>
                  <p className="text-sm text-muted-foreground">Из нашего офиса</p>
                </div>
                {deliveryType === 'SELF_PICKUP' && (
                  <Check className="h-5 w-5 text-primary ml-auto" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Delivery Address */}
          <AnimatePresence mode="wait">
            {deliveryType === 'DELIVERY' && (
              <motion.div
                key="delivery-address"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h2 className="font-semibold text-lg mb-4">Адрес доставки</h2>

                {addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={cn(
                          'flex items-start gap-4 p-4 rounded-xl border-2 w-full text-left transition-all',
                          selectedAddressId === address.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div
                          className={cn(
                            'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                            selectedAddressId === address.id ? 'bg-primary text-white' : 'bg-muted'
                          )}
                        >
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{address.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {address.fullAddress}
                          </p>
                        </div>
                        {selectedAddressId === address.id && (
                          <Check className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </button>
                    ))}

                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border w-full hover:border-primary/50 transition-colors"
                    >
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Добавить новый адрес</span>
                    </button>
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="mb-4">У вас пока нет сохранённых адресов</p>
                    <Button onClick={() => setShowAddressModal(true)}>
                      Добавить адрес
                    </Button>
                  </Card>
                )}
              </motion.div>
            )}

            {deliveryType === 'SELF_PICKUP' && businessSettings && (
              <motion.div
                key="pickup-address"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h2 className="font-semibold text-lg mb-4">Адрес самовывоза</h2>
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{businessSettings.name}</p>
                      <p className="text-sm text-muted-foreground">{businessSettings.address}</p>
                      {businessSettings.phone && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {businessSettings.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-semibold text-lg mb-4">Способ оплаты</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    paymentMethod === method.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium">{method.label}</span>
                  {paymentMethod === method.value && (
                    <Check className="h-5 w-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-semibold text-lg mb-4">Комментарий к заказу</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Пожелания к заказу, время доставки и т.д."
              className="w-full h-24 rounded-xl border-2 border-input bg-card px-4 py-3 text-sm resize-none focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </motion.div>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Ваш заказ</h2>

            {/* Items Preview */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto scrollbar-thin">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.product.photos[0] && (
                      <img
                        src={item.product.photos[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {item.rentalDays} дней
                    </p>
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    {formatPrice(item.totalPrice)} UZS
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Товары</span>
                <span>{formatPrice(subtotal)} UZS</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Скидка</span>
                  <span>-{formatPrice(totalSavings)} UZS</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span>{deliveryFee > 0 ? `${formatPrice(deliveryFee)} UZS` : 'Бесплатно'}</span>
              </div>

              <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                <span>Итого</span>
                <span className="text-primary">{formatPrice(total)} UZS</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              isLoading={createOrderMutation.isPending}
              disabled={deliveryType === 'DELIVERY' && !selectedAddressId}
              size="lg"
              variant="gradient"
              className="w-full"
            >
              Оформить заказ
            </Button>

            <p className="mt-4 text-xs text-center text-muted-foreground">
              Нажимая «Оформить заказ», вы соглашаетесь с условиями аренды
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Новый адрес"
        size="lg"
      >
        <AddressForm
          onSuccess={handleAddressCreated}
          onCancel={() => setShowAddressModal(false)}
        />
      </Modal>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutPageContent />
    </AuthGuard>
  );
}
