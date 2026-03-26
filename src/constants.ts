import { Service } from './types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'ig-followers',
    platform: 'Instagram',
    name: 'Seguidores Instagram',
    description: 'Seguidores de alta qualidade para o seu perfil do Instagram.',
    pricePerUnit: 300,
    minQuantity: 100,
    maxQuantity: 10000,
    providerServiceId: 1333, // Exemplo: ID do serviço no provedor
  },
  {
    id: 'tt-followers',
    platform: 'TikTok',
    name: 'Seguidores TikTok',
    description: 'Aumente sua audiência no TikTok rapidamente.',
    pricePerUnit: 500,
    minQuantity: 100,
    maxQuantity: 10000,
    providerServiceId: 2, // Exemplo: ID do serviço no provedor
  },
  {
    id: 'ig-likes',
    platform: 'Instagram',
    name: 'Curtidas Instagram',
    description: 'Curtidas reais para suas fotos e vídeos.',
    pricePerUnit: 150,
    minQuantity: 100,
    maxQuantity: 5000,
    providerServiceId: 1133, // Exemplo: ID do serviço no provedor
  },
  {
    id: 'tt-views',
    platform: 'TikTok',
    name: 'Visualizações TikTok',
    description: 'Aumente o alcance dos seus vídeos no TikTok.',
    pricePerUnit: 50,
    minQuantity: 100,
    maxQuantity: 50000,
    providerServiceId: 1312, // Exemplo: ID do serviço no provedor
  }
];
