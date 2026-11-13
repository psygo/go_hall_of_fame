import { FeedbackForm } from "../components/feedback-form"
import { PageHeader } from "@/shared/ui/presentation/page-header"
import { getMessages } from "@/shared/i18n/presentation/server-locale"

type Contributor = {
  readonly name: string
  readonly role: "roleCreator"
  readonly picture: string
  readonly href?: string
}

const CONTRIBUTORS: readonly Contributor[] = [
  {
    name: "Philippe Fanaro",
    role: "roleCreator",
    picture: "/images/contributors/philippe-fanaro.jpg",
    href: "https://github.com/psygo",
  },
]

export async function AboutScreen() {
  const messages = await getMessages()

  return (
    <>
      <PageHeader
        eyebrow={messages.aboutEyebrow}
        title={messages.aboutTitle}
      >
        <p className="mt-4 max-w-[56ch] text-lg">
          {messages.aboutIntro}
        </p>
      </PageHeader>
      <section className="px-4 py-8">
        <h2 className="text-2xl font-bold">
          {messages.builtBy}
        </h2>
        <p className="mt-1 mb-6">
          {messages.contributorsIntro}
        </p>
        <ul className="m-0 grid list-none gap-6 p-0 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3">
          {CONTRIBUTORS.map((person) => (
            <li
              key={person.name}
              className="border-divider flex items-center gap-4 border p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={person.picture}
                alt=""
                referrerPolicy="no-referrer"
                loading="lazy"
                width={72}
                height={72}
                className="size-[72px] rounded-full object-cover"
              />
              <div>
                <div className="font-bold">
                  {person.href === undefined ? (
                    person.name
                  ) : (
                    <a
                      href={person.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {person.name}
                    </a>
                  )}
                </div>
                <div className="text-sm opacity-70">
                  {messages[person.role]}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="border-divider relative border-t px-4 py-8">
        <FeedbackForm />
      </section>
    </>
  )
}
