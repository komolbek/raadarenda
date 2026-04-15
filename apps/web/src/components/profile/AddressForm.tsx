'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { userApi } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Address } from '@/types';

interface AddressFormProps {
  address?: Address;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: address?.title || '',
    fullAddress: address?.fullAddress || '',
    city: address?.city || 'Ташкент',
    district: address?.district || '',
    street: address?.street || '',
    building: address?.building || '',
    apartment: address?.apartment || '',
    entrance: address?.entrance || '',
    floor: address?.floor || '',
    latitude: address?.latitude || null,
    longitude: address?.longitude || null,
    isDefault: address?.isDefault || false,
  });

  const toApiData = (data: typeof formData) => ({
    title: data.title,
    full_address: data.fullAddress,
    city: data.city,
    district: data.district || undefined,
    street: data.street || undefined,
    building: data.building || undefined,
    apartment: data.apartment || undefined,
    entrance: data.entrance || undefined,
    floor: data.floor || undefined,
    latitude: data.latitude ?? undefined,
    longitude: data.longitude ?? undefined,
    is_default: data.isDefault,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => userApi.createAddress(toApiData(data)),
    onSuccess: () => {
      toast.success(t('address_form.added'));
      onSuccess();
    },
    onError: () => {
      toast.error(t('address_form.add_error'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => userApi.createAddress(toApiData(data)),
    onSuccess: () => {
      toast.success(t('address_form.updated'));
      onSuccess();
    },
    onError: () => {
      toast.error(t('address_form.update_error'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(t('address_form.name_required'));
      return;
    }
    if (!formData.fullAddress.trim()) {
      toast.error(t('address_form.address_required'));
      return;
    }

    if (address) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('address_form.name_label')}
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder={t('address_form.name_placeholder')}
      />

      <Input
        label={t('address_form.full_address_label')}
        value={formData.fullAddress}
        onChange={(e) => handleChange('fullAddress', e.target.value)}
        placeholder={t('address_form.full_address_placeholder')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('address_form.city')}
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
        />
        <Input
          label={t('address_form.district')}
          value={formData.district}
          onChange={(e) => handleChange('district', e.target.value)}
          placeholder={t('address_form.district_placeholder')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('address_form.street')}
          value={formData.street}
          onChange={(e) => handleChange('street', e.target.value)}
        />
        <Input
          label={t('address_form.building')}
          value={formData.building}
          onChange={(e) => handleChange('building', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label={t('address_form.apartment')}
          value={formData.apartment}
          onChange={(e) => handleChange('apartment', e.target.value)}
        />
        <Input
          label={t('address_form.entrance')}
          value={formData.entrance}
          onChange={(e) => handleChange('entrance', e.target.value)}
        />
        <Input
          label={t('address_form.floor')}
          value={formData.floor}
          onChange={(e) => handleChange('floor', e.target.value)}
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) => handleChange('isDefault', e.target.checked)}
          className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
        />
        <span>{t('address_form.set_default')}</span>
      </label>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          {t('address_form.cancel')}
        </Button>
        <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
          {address ? t('address_form.save') : t('address_form.add')}
        </Button>
      </div>
    </form>
  );
}
