import type { Company, CompanyStatus, Collection } from './types';
import { getStatusFromCollectionName } from './types';

export function getCompanyStatus(
  company: Company,
  currentCollection?: Collection
): CompanyStatus {
  if (company?.status) {
    return company.status;
  }

  if (currentCollection?.collection_name) {
    return getStatusFromCollectionName(currentCollection.collection_name);
  }

  return company?.liked ? 'liked' : 'new';
}

export function getStatusStyles(status: CompanyStatus): string {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'liked':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ignore':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}

export function getStatusLabel(status: CompanyStatus): string {
  switch (status) {
    case 'new':
      return 'New';
    case 'liked':
      return 'Liked';
    case 'ignore':
      return 'Ignore';
    default:
      return 'New';
  }
}

export function getCompanyStatusDisplay(
  company: Company,
  currentCollection?: Collection
) {
  const status = getCompanyStatus(company, currentCollection);
  return {
    status,
    label: getStatusLabel(status),
    styles: getStatusStyles(status),
  };
}
