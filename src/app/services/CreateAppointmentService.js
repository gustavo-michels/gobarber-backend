import { startOfHour, isBefore, parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import User from '../models/User';
import Appointment from '../models/Appointment';

import Notification from '../Schemas/Notification';

import Cache from '../../lib/Cache';
import CustomException from '../../lib/CustomException';

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    /*
    Check is provider_id is a provider
    */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      throw new CustomException(
        'You can only create appointments with providers'
      );
    }

    /*
  Check if user and provider aren't same.
  */
    if (provider_id === user_id) {
      throw new CustomException('You cannot schedule with yourself');
    }

    /*
  Check for past dates
  */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new CustomException('Past dates are not permitted');
    }

    /*
  Check date availability
  */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      throw new CustomException('Appointment date is not available');
    }

    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });

    /*
    Notify appointment provider
  */
    const user = await User.findByPk(user_id);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate} `,
      user: provider_id,
    });

    /**
     * Invalidate cache
     */
    await Cache.invalidatePrefix(`user:${user_id}:appointments`);

    return appointment;
  }
}

export default new CreateAppointmentService();
