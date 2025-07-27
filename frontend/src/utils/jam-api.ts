import axios from 'axios';
import type {
  Company,
  Collection,
  TransferRequest,
  TransferResponse,
  TransferJob,
} from '@/lib/types';
import { handleApiError } from '@/lib/error-handling';

export interface CompanyBatchResponse {
  companies: Company[];
}

// API-specific collection interface that extends the base Collection type
export interface ApiCollection extends Collection {
  companies: Company[];
  total: number;
}

const BASE_URL = 'http://localhost:8000';

export async function getCompanies(
  offset?: number,
  limit?: number
): Promise<CompanyBatchResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/companies`, {
      params: {
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw handleApiError(error);
  }
}

export async function getCollectionsById(
  id: string,
  offset?: number,
  limit?: number,
  search?: string
): Promise<ApiCollection> {
  try {
    const params = {
      offset,
      limit,
      search: search || '',
    };

    const response = await axios.get(`${BASE_URL}/collections/${id}`, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw handleApiError(error);
  }
}

export async function getCollectionsMetadata(): Promise<Collection[]> {
  try {
    const response = await axios.get(`${BASE_URL}/collections`);
    return response.data;
  } catch (error) {
    console.error('Error fetching collections metadata:', error);
    throw handleApiError(error);
  }
}

// Transfer API functions
export async function transferCompanies(
  collectionId: string,
  request: TransferRequest
): Promise<TransferResponse> {
  try {
    const url = `${BASE_URL}/collections/${collectionId}/transfer`;
    const response = await axios.post(url, request);
    return response.data;
  } catch (error) {
    console.error('❌ Error transferring companies:', error);
    throw handleApiError(error);
  }
}

export async function getJobStatus(jobId: string): Promise<TransferJob> {
  try {
    const url = `${BASE_URL}/collections/jobs/${jobId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching job status:', error);
    throw handleApiError(error);
  }
}
