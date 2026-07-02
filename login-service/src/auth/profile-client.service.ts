import { Injectable, ServiceUnavailableException, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProfileClientService {
  private readonly logger = new Logger(ProfileClientService.name);
  private readonly userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
  private readonly internalSecret =
    process.env.INTERNAL_API_SECRET || 'dev-internal-secret-ganti-nanti';

  async createProfile(profileId: string, accountId: string, role: 'candidate' | 'company') {
    try {
      await axios.post(
        `${this.userServiceUrl}/internal/profiles`,
        { profileId, accountId, role },
        { headers: { 'x-internal-secret': this.internalSecret } },
      );
    } catch (err) {
      this.logger.error(`Gagal bikin profil di user-service: ${err.message}`);
      throw new ServiceUnavailableException(
        'Gagal membuat profil, silakan coba register lagi',
      );
    }
  }
}