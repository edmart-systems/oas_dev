interface SaveUpdateOptions {
  endpoint: string;
  data: any;
  id?: string | number;
  onSuccess?: () => void;
}

export const saveOrUpdate = async ({ endpoint, data, id, onSuccess }: SaveUpdateOptions) => {
  try {
    const url = id ? `${endpoint}/${id}` : endpoint;
    const method = id ? 'PATCH' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    let responseData = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
    }
    
    if (!res.ok) {
      throw new Error(responseData?.error || responseData?.message || 'Save failed');
    }
    
    const { toast } = await import('react-toastify');
    toast.success(id ? 'Updated successfully' : 'Created successfully');
    
    if (onSuccess) onSuccess();
    
    return responseData;
  } catch (error: any) {
    const { toast } = await import('react-toastify');
    toast.error(error.message || 'Save failed');
    throw error;
  }
};

