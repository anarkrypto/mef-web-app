// Used only to force forbidden redirects
// TODO: remove this when we implement SSR authentication roles logic in the future

import { forbidden } from 'next/navigation'

export default function Forbidden() {
	forbidden()
}
