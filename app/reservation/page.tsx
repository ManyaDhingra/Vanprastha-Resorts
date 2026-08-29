import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Reservation & Cancellation — Vanprastha Resorts',
  description: 'Reservation, cancellation, and terms for Vanprastha Resorts stays.',
}

export default function ReservationPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-28 pb-16">
      <h1 className="font-heading text-3xl font-normal leading-[1.15] text-text sm:text-4xl">
        Reservation &amp; Cancellation
      </h1>
      <p className="mt-2 text-sm text-text-muted">Vanprastha Resorts</p>

      <div className="mt-8 space-y-10 text-sm leading-relaxed text-text-muted">
        {/* RESERVATION */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Reservation</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>Please make advance reservations via email or telephone or book online to ensure room availability.</li>
            <li>Advance through online transfer is mandatory to obtain the confirmed reservation. Please read the cancellation policy before obtaining the confirmed reservation.</li>
            <li>Rates displayed online are not guaranteed until the confirmation voucher is generated. The rates are generally dynamic in nature. Once a rate is selected and a transaction is executed by you, no other rate is applicable either higher or lower and no refund is admissible.</li>
            <li>The estimated cost for stay includes the confirmed room rate, the estimated taxes, and estimated fees.</li>
            <li>The actual taxes, fees and cess prevalent at the time of stay shall be applicable, which may vary from the estimates and you are liable to pay any extra cost on account of such amendments in taxes, fees, cess etc.</li>
            <li>Currency conversions are estimates and are provided as information only. The bill on check out for stay shall be charged in the resort&apos;s local currency.</li>
            <li>We reserve the right to modify or cancel the reservation if it appears, at sole discretion of the resort, that a guest is engaged in fraudulent, illegal or other inappropriate activity or the reservation is obtained fraudulently or with malafide intention or mistake or error.</li>
            <li>On check in to the resort, please present the reservation confirmation voucher along with valid photo ID or Passport, Photo PAN Card, Election Identity Card, Photo driving licence, or any photo ID card issued by Central/State government and a valid credit card for any incidental and/or extra charges.</li>
            <li>For Foreign nationals, a passport is mandatory.</li>
            <li>All promotion/sale rates are restrictive fares and are non-refundable. Certain promotion/sale rates do not permit any changes in the resort booking. Please check restrictions on the rate while booking. Under all promotion(s)/sale rates, limited inventory is available on select room type(s) only on a first come first served basis. Vanprastha Resorts reserves the right to withdraw and/or amend the promotion/sale without any prior notice.</li>
            <li>All extra services &amp; amenities not part of this offer will be available at an additional charge only.</li>
            <li>This offer cannot be combined with any other offer/promotion or benefit(s) available through any loyalty program run by Vanprastha Resorts or any third party.</li>
            <li>In case of non-availability of a pre-booked room at the time of arrival, the resort will offer an alternate similar standard resort/in a similar room type, at its discretion and without any further liability.</li>
            <li>Rates may change without notice and may vary for special events except for confirmed reservation against the advance payment.</li>
            <li>All rates are subject to prevailing local taxes as applicable on room tariff &amp; services opted.</li>
          </ul>
        </section>

        {/* OCCUPANCY */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Occupancy</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>Normal occupancy permits a maximum of two people per room. Additional person (if room size permits) is charged extra as per the prevalent rate of the resort.</li>
          </ul>
        </section>

        {/* DEPOSIT / ONLINE PAYMENT */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Deposit / Online Payment</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>The deposit / online payment to be paid in advance equivalent to total room nights booked for the entire stay to get the confirmed reservation.</li>
            <li>We accept deposits only against the Maestro, Visa and MasterCard. For any alternate mode of payment, please contact the resort&apos;s reservations.</li>
            <li>Corporate reservations need to be secured by NEFT or a company credit card. For any alternate mode of payment, please contact the resort&apos;s Reservation.</li>
            <li>Group bookings of four or more rooms require cancellation notice to refund the deposit as specified in cancellation &amp; early checkout policy.</li>
          </ul>
        </section>

        {/* CHECK IN */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Check In</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>Fully vaccinated guests must share their final vaccination certificates (double) before check-in. While at the resort, COVID protocols will be strictly followed.</li>
            <li>Normal check in time is 1:00 p.m. For late arrivals, please call for instructions on the procedure for arrival after 6 p.m.</li>
            <li>Check-out is at 11 a.m.</li>
            <li>Early check-in and check-out is available by prior arrangement only, subject to availability and prior intimation &amp; confirmation only.</li>
          </ul>
        </section>

        {/* MODIFICATION */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Modification</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>Any modification in the reservation is subject to availability at the time of making such a request.</li>
          </ul>
        </section>

        {/* CHILDREN AND INFANTS */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Children and Infants</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>Children up to 5 years can stay free of charge with parents without an extra bed.</li>
            <li>Children between 5 years to 12 years of age will be charged extra.</li>
            <li>Children above 12 years of age will be treated as young adults and the prevalent reservation charges will be applicable and levied.</li>
          </ul>
        </section>

        {/* NON-ARRIVAL TO THE RESORT (NO SHOW) */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Non-Arrival to the Resort (No Show)</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>If you fail to arrive at the resort on the arrival date the entire reservation will be cancelled automatically by the resort and will be charged for the entire reservation.</li>
            <li>If you fail to check in on the first date but still continue your travel plan to stay at the resort, please urgently contact us to keep the room for you for the rest of the nights. Otherwise, as mentioned above, the entire reservation will be auto-cancelled and no refund admissible.</li>
          </ul>
        </section>

        {/* SHORTENED STAY (EARLY CHECK-OUT) */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Shortened Stay (Early Check-Out)</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>Shortened stay is subject to the entire period charge whether or not you stay the entire period. If you know the change in your plan, please contact us at the earliest to minimise the charge by the resort subject to cancellation policy.</li>
          </ul>
        </section>

        {/* SPECIAL REQUEST */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Special Request</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>Please note that the resort neither guarantees nor is liable to admit any request for amendment in plan or any other special requests, which shall be admissible subject to availability on arrival.</li>
            <li>The request for airport pick-up requires intimation to the reservation at the time of the room(s) booking.</li>
          </ul>
        </section>

        {/* CONFIRMATION VOUCHER */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Confirmation Voucher</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>The reservation once confirmed, a confirmation number and the voucher is generated that you can print for your convenience. It is necessary to present the confirmation voucher to the resort on arrival. Failure to produce the confirmation voucher may result in the resort not honouring your reservation unless the resort is able to trace &amp; match the excess in the reservation system.</li>
          </ul>
        </section>

        {/* PAYMENT SECURITY */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Payment Security</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>It is important to know that whenever you provide the personal details or credit card information, it is secured. Your credit card number, name, address, and telephone number are protected by the latest security technology.</li>
          </ul>
        </section>

        {/* CANCELLATION */}
        <section>
          <h2 className="mb-4 font-heading text-lg font-medium text-text">Cancellation</h2>
          <ul className="list-disc space-y-3 pl-5">
            <li>In case your plans change, ensure to inform in writing the cancellation/amendments in plan to the resort Reservation for a refund of your deposit. The guidelines in this regard are as under:</li>
            <li>The modification/cancellation request for bookings made online will be processed automatically through the Internet Booking Engine. Any refund due shall be done through the system in accordance with the applicable modification/cancellation rules. In case of rebooking, a rate difference may be payable for the change as per the rate applicable for the rebooked date/room type and subject to availability.</li>
            <li>Any additional charges or rate difference for the modified reservation can be paid through the same payment mode/card as used for original reservation.</li>
            <li>Please note that if an online booking is modified or cancelled with the resort&apos;s reservations office/sales office, it cannot be further modified or cancelled online.</li>
            <li>The refund of the reservation done by the Travel Agent will be processed by the issuing Travel Agent only and no refund admissible online.</li>
            <li>In the event of cancellation of non-cancellable booking(s), the client shall not be refunded the amount paid towards making the reservation(s).</li>
            <li>In case of early checkout, you are liable to pay for the entire confirmed reservation. If not sure of the policy, contact the resort for clarification.</li>
            <li>The cancellation before 30 days prior to arrival date, the reservation will be subject to a cancellation fee equivalent to 30% of total amount.</li>
            <li>The cancellation between 15 to 30 days prior to arrival date, the reservation will be subject to a cancellation fee equivalent to 50% of total amount.</li>
            <li>The cancellation less than 15 days prior to arrival date, the reservation will be subject to a cancellation fee equivalent to 100% of total amount.</li>
          </ul>
        </section>
      </div>

      <div className="mt-10">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          &larr; Back to home
        </Link>
      </div>
    </main>
  )
}
