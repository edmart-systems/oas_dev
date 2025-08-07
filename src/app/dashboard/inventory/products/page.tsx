'use client';

import ScreenLoader from '@/components/common/screen-loading';
import ProductsPage from '@/components/dashboard/inventory/products';
import { useSession } from 'next-auth/react';
import React from 'react'

const Products = () => {
  const { data: session, status } = useSession();


  return (
    <ProductsPage />
  ) 
}

export default Products