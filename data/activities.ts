export interface ActivityImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface Activity {
  id: string
  name: string
  quote: string
  images: ActivityImage[]
}

export const activities: Activity[] = [
  {
    id: 'nature-walking',
    name: 'Nature Walking',
    quote:
      'In every walk in with mother nature, one receives far more than he seeks...',
    images: [
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Trekking-3-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Nature walking through the Himalayan foothills',
        width: 870,
        height: 580,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Nature-Walking-9-1-1024x682-2.jpg?fit=870%2C579&ssl=1',
        alt: 'Forest trail near Vanprastha Resorts',
        width: 870,
        height: 579,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Trekking-8-1024x682-1-1.jpg?fit=870%2C579&ssl=1',
        alt: 'Mountain path surrounded by pine trees',
        width: 870,
        height: 579,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Nature-Walking-3-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Walking through the Dunagiri landscape',
        width: 870,
        height: 580,
      },
    ],
  },
  {
    id: 'meditation',
    name: 'Meditation',
    quote:
      'By the practice of meditation, you will find that you are carrying within your heart a portable paradise',
    images: [
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Meditation-4-4-1024x683-2.jpg?fit=870%2C580&ssl=1',
        alt: 'Meditation session at the resort',
        width: 870,
        height: 580,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Meditation-6-1-2-1024x682-1.jpg?fit=870%2C579&ssl=1',
        alt: 'Peaceful meditation in the Himalayas',
        width: 870,
        height: 579,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Meditation-5-5-1024x697-2.jpg?fit=870%2C592&ssl=1',
        alt: 'Guided meditation overlooking the mountains',
        width: 870,
        height: 592,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Meditation-9-1-1024x682-1.jpg?fit=870%2C579&ssl=1',
        alt: 'Stillness and calm at Vanprastha',
        width: 870,
        height: 579,
      },
    ],
  },
  {
    id: 'trekking',
    name: 'Trekking',
    quote:
      'Do not follow where the path may lead Go instead where there is no path and leave a trail',
    images: [
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Trekking-3-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Trekking through the Himalayan terrain',
        width: 870,
        height: 580,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Trekking-2-1024x682-1.jpg?fit=870%2C579&ssl=1',
        alt: 'Mountain trail near Dunagiri',
        width: 870,
        height: 579,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Trekking-1-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Trekking through pine forests',
        width: 870,
        height: 580,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Trekking-8-1024x682-1-1.jpg?fit=870%2C579&ssl=1',
        alt: 'Uttarakhand mountain paths',
        width: 870,
        height: 579,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Trekking-9-2-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Panoramic trekking views',
        width: 870,
        height: 580,
      },
    ],
  },
  {
    id: 'bird-watching',
    name: 'Bird Watching',
    quote:
      'Faith is the bird that feels the light when the dawn is still dark',
    images: [
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Bird-Watching-12-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Bird watching in the Himalayan foothills',
        width: 870,
        height: 580,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Bird-Watching-13-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Mountain birds near the resort',
        width: 870,
        height: 580,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Bird-Watching-8-1-1024x682-1.jpg?fit=870%2C579&ssl=1',
        alt: 'Avian diversity at Dunagiri',
        width: 870,
        height: 579,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Bird-Watching-7-1024x683-2.jpg?fit=870%2C580&ssl=1',
        alt: 'Observing birds in their natural habitat',
        width: 870,
        height: 580,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Bird-Watching-3-1.jpg?fit=275%2C183&ssl=1',
        alt: 'Close-up of Himalayan birdlife',
        width: 275,
        height: 183,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Mountain-Biking-6-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Nature trails for bird watching',
        width: 870,
        height: 580,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Bird-Watching-9-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Birds of Uttarakhand',
        width: 870,
        height: 580,
      },
    ],
  },
  {
    id: 'mountain-biking',
    name: 'Mountain Biking',
    quote:
      'Life is like riding a bicycle. In order to keep your balance, you must keep moving',
    images: [
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Mountain-Biking-8-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Mountain biking through the Himalayas',
        width: 870,
        height: 580,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Mountain-Biking-1-2-1024x682-1.jpg?fit=870%2C579&ssl=1',
        alt: 'Cycling on mountain trails',
        width: 870,
        height: 579,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Mountain-Biking-2-1-1024x682-1.jpg?fit=870%2C579&ssl=1',
        alt: 'Biking adventure near Vanprastha',
        width: 870,
        height: 579,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Mountain-Biking-4-1-1024x682-2.jpg?fit=870%2C579&ssl=1',
        alt: 'Riding through Uttarakhand landscapes',
        width: 870,
        height: 579,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Mountain-Biking-5-1-1024x683-1.jpg?fit=870%2C580&ssl=1',
        alt: 'Mountain biking trails with valley views',
        width: 870,
        height: 580,
      },
    ],
  },
  {
    id: 'star-gazing',
    name: 'Star Gazing',
    quote:
      'Stargazing eases our minds and rejuvenates our spirits, and research has shown that it makes us more compassionate toward others.',
    images: [
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/woman_Horizon_Comet_m1-736x490-c-default.jpg?fit=736%2C490&ssl=1',
        alt: 'Star gazing over the Himalayan sky',
        width: 736,
        height: 490,
      },
      {
        src: 'https://i0.wp.com/vanprastharesorts.com/wp-content/uploads/2022/03/Dark-cloud-Auriga-dark-nebula-ST-736x490-c-default.jpg?fit=736%2C490&ssl=1',
        alt: 'Night sky over Dunagiri mountains',
        width: 736,
        height: 490,
      },
    ],
  },
]
