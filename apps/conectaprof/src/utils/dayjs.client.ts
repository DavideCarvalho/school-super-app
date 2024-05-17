import dayjs from "dayjs";

import "dayjs/locale/pt-br";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.locale("pt-br");
dayjs.extend(isoWeek);

export const dayjsClient = dayjs;
