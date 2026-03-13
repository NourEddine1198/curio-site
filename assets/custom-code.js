document.addEventListener('DOMContentLoaded', function () {
  // ─── API Configuration ─────────────────────────────────────
  // Points to the Next.js store API. Change this URL after deploying.
  var CURIO_API = 'https://stirring-marigold-3dd8e9.netlify.app';

  // Maps product keys to database slugs
  var PRODUCT_SLUGS = {
    goul: 'goul-bla-matgoul',
    roubla: 'roubla',
    bundle: 'eid-2026-bundle'
  };

  var PRODUCT_CATALOG = {
    goul: {
      key: 'goul',
      label: 'Ù‚ÙˆÙ„ Ø¨Ù„Ø§ Ù…ØªÙ‚ÙˆÙ„',
      price: 2390,
      id: '0123e17d-9fe0-425f-869a-15294d393719',
      url: 'https://curio-games.youcan.store/products/kol-bla-mtkol',
      cover: 'https://cdn.youcan.shop/stores/ff74f4ffdad9c4ed8f3aa026fd949f86/products/N0VIv63VwJaUc6UfY6i9DTlRO5TAQOaRtFZW8FOj_lg.jpg',
      coverAlt: 'علبة قول بلا متقول مع ثلاث بطاقات أمثلة',
      cardPosition: 'center 52%'
    },
    roubla: {
      key: 'roubla',
      label: 'Ø±ÙˆØ¨Ù„Ø©',
      price: 2390,
      id: 'a1475df7-4f99-43dc-b6c8-ab14f05c83d6',
      url: 'https://curio-games.youcan.store/products/roubla',
      cover: 'https://cdn.youcan.shop/stores/ff74f4ffdad9c4ed8f3aa026fd949f86/products/aUY8yhxSYUJG16DJkillgzmsqlZkJkdJ3ueSAJic_lg.jpg',
      coverAlt: 'صورة علوية للعبة روبلة مع بطاقات الحروف والمواضيع',
      cardPosition: 'center center'
    },
    bundle: {
      key: 'bundle',
      label: 'Ø¨Ø§Ùƒ Ø§Ù„Ø¹ÙŠØ¯ 2026',
      price: 3900,
      compareAt: 4780,
      id: '7c8f3100-c3a7-466b-bf04-e3ef3a2eaa32',
      url: 'https://curio-games.youcan.store/products/eid-2026-bundle',
      cover: 'https://cdn.youcan.shop/stores/ff74f4ffdad9c4ed8f3aa026fd949f86/products/sBgt79e9ZQXO5h4nrWppE19yka8Xn7YUSK5tFx8H_lg.jpg',
      coverAlt: 'روبلة و قول بلا متقول على طاولة قعدة',
      cardPosition: 'center center',
      heroPosition: 'center 48%'
    }
  };

  // Editable copy block: change page text here first, then publish to YouCan after validation.
  var STORE_COPY = {
    common: {
      labels: {
        name: 'الاسم',
        phone: 'رقم الهاتف',
        wilaya: 'الولاية',
        coupon: 'كود التخفيض'
      },
      placeholders: {
        wilaya: 'اختار الولاية',
        office: 'اختار المكتب',
        officeBeforeWilaya: 'اختار الولاية أولا',
        coupon: 'إذا عندك كود، دخلو هنا'
      },
      hints: {
        coupon: 'إذا عندك كود تخفيض دخلو هنا. نراجعوه معاك في التأكيد.'
      },
      summary: {
        chooseWilaya: 'اختار الولاية',
        unavailable: 'غير متوفر',
        totalPending: '--',
        homeDefault: 'السعر النهائي يبان هنا كي تختار الولاية ونوع التوصيل. الطلب يتأكد معاك بالتلفون قبل الشحن.',
        noShipping: 'لهاذ الولاية ماكانش ثمن توصيل مضبوط في الداتا الحالية.',
        noOffice: 'ماكانش stop desk مضبوط لهذه الولاية حاليا. بدّل للدار ولا اختار ولاية أخرى.',
        officeReady: 'أنت راك تختار stop desk. لازم تختار المكتب قبل ما تبعث الطلب.',
        homeReady: 'أنت راك مختار التوصيل للدار. دخل العنوان بالتفصيل باش ما يكونش لخباط.'
      },
      messages: {
        noOfficeConfigured: 'ماكانش مكاتب stop desk مضبوطة لهذه الولاية حاليا. بدّل للدار ولا اختار ولاية أخرى.',
        chooseProduct: 'اختار واش تحب تطلب.',
        enterName: 'دخل الاسم الكامل.',
        invalidPhone: 'دخل رقم هاتف صحيح (10 أرقام، يبدا بـ 05 أو 06 أو 07).',
        chooseWilayaBeforeContinue: 'اختار الولاية قبل ما تكمل.',
        chooseWilaya: 'اختار الولاية.',
        shippingUnavailable: 'ثمن التوصيل لهذه الولاية مازال ما تضبطش.',
        enterAddressLong: 'دخل العنوان بالتفصيل باش نوصلوه حتى للدار.',
        enterAddressShort: 'دخل العنوان بالتفصيل.',
        noOfficesAvailable: 'ماكانش مكاتب متاحة لهذه الولاية حاليا.',
        chooseOffice: 'اختار المكتب لي تحب تستلم منه.',
        previewOnly: 'الطلب المباشر يخدم غير داخل صفحة YouCan الحقيقية. هنا تقدر غير تراجع الواجهة.',
        submitLoading: 'راك تبعث الطلب...',
        submitSuccess: 'تم إرسال الطلب. راك تتحول لصفحة التأكيد...',
        fallback: 'صار مشكل بسيط. راجع المعلومات وحاول مرة أخرى.',
        fallbackFields: 'راجع المعلومات: الاسم، الهاتف، والولاية لازم يكونو معمّرين بصح.'
      },
      buttons: {
        submit: 'قدم طلبك الان',
        submitLoading: 'راك تبعث الطلب...'
      },
      scrollCta: {
        needle: 'اطلبها دروك',
        label: 'اطلب دروك!'
      }
    },
    home: {
      strip: ['الدفع عند الاستلام', 'التوصيل لكل الولايات', ''],
      kicker: 'Curio | ألعاب جزائرية بالدارجة',
      title: 'نَصنع العابا تَصنع ذكريات لا تُنسى',
      lead: 'عندنا روبلة، قول بلا متقول، وبزاف ألعاب راهم جايين فالطريق.',
      ctas: {
        primary: 'قدم طلبية الان',
        secondary: 'شوف الألعاب لي عندنا'
      },
      badges: {
        hidePrices: true,
        singleSuffix: '',
        bundleSuffix: '',
        confirmation: ''
      },
      showHeroMedia: false,
      heroNote: {
        title: 'زوج ألعاب في باك واحد',
        subtitle: 'لللمة، للكادو، ولا للعيد'
      },
      order: {
        title: 'الطلب السريع',
        intro: 'اختار المنتج، دخل معلوماتك، وحدد واش تحب التوصيل للدار ولا للمكتب.',
        productLabel: 'خير اللعبة لي حبيتها؟',
        nameLabel: 'الاسم الكامل',
        namePlaceholder: 'مثال: محمد بن علي',
        phoneLabel: 'رقم الهاتف',
        phonePlaceholder: '06xxxxxxxx',
        wilayaLabel: 'الولاية',
        deliveryLegend: 'نوع التوصيل',
        homeTitle: 'للدار',
        homeDesc: '',
        officeTitle: 'للمكتب',
        officeDesc: '',
        addressLabel: 'العنوان بالتفصيل',
        addressPlaceholder: 'الحي، رقم الدار/العمارة، الطابق، معالم قريبة...',
        officeLabel: 'اختار المكتب (شركة Anderson)'
      },
      summary: {
        productLabel: 'المنتج',
        productPriceLabel: 'ثمن المنتج',
        deliveryPriceLabel: 'ثمن التوصيل',
        totalLabel: 'المجموع'
      },
      viewPageLabel: '',
      cards: {
        goul: {
          description: 'لعبة تحدي لازم تخلي صحابك يلقاو الكلمة الرئيسية بلا ما تقول الكلمات الممنوعة.',
          tags: ['4+ لاعبين', '20-45 دقيقة', '16 سنة وطالع'],
          primary: 'كوموندي قول بلا ماتقول'
        },
        roubla: {
          description: 'لعبة سرعة وتنافس. حرف وموضوع، واللي يجاوب قبل كامل هو اللي يربح.',
          tags: ['2+ لاعبين', '15-30 دقيقة', '16 سنة وطالع'],
          primary: 'كوموندي روبلة'
        },
        bundle: {
          description: 'روبلة + قول بلا متقول. ثمن أوفر من شراء كل لعبة وحدها،',
          tags: ['زوج ألعاب', 'توفير 880 DA', 'كادو واجد'],
          primary: 'كوموندي الpack'
        }
      },
      notes: [
        { title: 'التوصيل واضح', body: 'تختار الولاية ونوع التوصيل، وثمن الشحن يبان قدامك بلا تخمين وبلا مفاجآت.' },
        { title: 'اختيار المكتب', body: 'إذا فضلت stop desk، تختار المكتب من نفس الولاية قبل ما تبعث الطلب.' },
        { title: 'التأكيد قبل الشحن', body: 'أي طلب يمر من تأكيد بالتلفون قبل ما يخرج، باش يكون كلش واضح ومضبوط.' }
      ],
      foot: 'إذا حبيت التفاصيل أكثر، تقدر تمشي لصفحات المنتجات الأصلية من أزرار "شوف الصفحة".'
    },
    productPanel: {
      title: 'اختار التوصيل ديالك',
      deliveryLegend: 'نوع التوصيل',
      homeTitle: 'للدار',
      homeDesc: 'العنوان بالتفصيل والتوصيل حتى لباب الدار.',
      officeTitle: 'للمكتب',
      officeDesc: 'تختار الولاية ومن بعدها تختار المكتب المناسب.',
      addressLabel: 'العنوان بالتفصيل',
      addressPlaceholder: 'الحي، العمارة، الطابق، معالم قريبة...',
      officeLabel: 'اختار المكتب',
      officeHint: 'المكتب يتبدل حسب الولاية لي تختارها.',
      inlineNote: 'الطلب يتأكد معاك بالتلفون قبل الشحن. ثمن التوصيل يبان هنا قبل ما تكمل.',
      summary: {
        productLabel: 'المنتج',
        productPriceLabel: 'ثمن المنتج',
        deliveryPriceLabel: 'ثمن التوصيل',
        totalLabel: 'المجموع'
      }
    }
  };

  var DELIVERY_DATA = [{"code":1,"label":"01 - أدرار","home":1650,"office":850,"offices":{"label":"Station Adrar - Adrar","station":"Station Adrar","commune":"Adrar","phone":["0660709353"]}},{"code":2,"label":"02 - الشلف","home":700,"office":450,"offices":{"label":"Station Chlef - Chlef","station":"Station Chlef","commune":"Chlef","phone":["0770511166","0670675881"]}},{"code":3,"label":"03 - الأغواط","home":850,"office":450,"offices":[{"label":"Station Laghouat - Laghouat","station":"Station Laghouat","commune":"Laghouat","phone":[]},{"label":"Station Laghouat New - Laghouat","station":"Station Laghouat New","commune":"Laghouat","phone":["0770953193"]}]},{"code":4,"label":"04 - أم البواقي","home":850,"office":450,"offices":[{"label":"Station Oum El Bouaghi - Oum El Bouaghi","station":"Station Oum El Bouaghi","commune":"Oum El Bouaghi","phone":["0660877228","0660128008"]},{"label":"Station Ain Fekroune - Ain Fekroune","station":"Station Ain Fekroune","commune":"Ain Fekroune","phone":[]},{"label":"Station AÃ¯n M\u0027lila - Ain M\u0027lila","station":"Station AÃ¯n M\u0027lila","commune":"Ain M\u0027lila","phone":["0770531702"]}]},{"code":5,"label":"05 - باتنة","home":850,"office":450,"offices":[{"label":"Station Batna - CitÃ© El Amrani - Oued Chaaba","station":"Station Batna - CitÃ© El Amrani","commune":"Oued Chaaba","phone":["0770531028"]},{"label":"Station Batna - Batna","station":"Station Batna","commune":"Batna","phone":["0770637788","0770518901"]}]},{"code":6,"label":"06 - بجاية","home":850,"office":450,"offices":[{"label":"Station BÃ©jaÃ¯a - Akbou - Akbou","station":"Station BÃ©jaÃ¯a - Akbou","commune":"Akbou","phone":["0550295278","0770807317"]},{"label":"Station BÃ©jaÃ¯a - Bejaia","station":"Station BÃ©jaÃ¯a","commune":"Bejaia","phone":["0560250529","0770753564"]},{"label":"Station El Kseur - El Kseur","station":"Station El Kseur","commune":"El Kseur","phone":["0560817050"]}]},{"code":7,"label":"07 - بسكرة","home":850,"office":650,"offices":{"label":"Station Biskra - Biskra","station":"Station Biskra","commune":"Biskra","phone":["0770522149"]}},{"code":8,"label":"08 - بشار","home":1200,"office":650,"offices":{"label":"Station BÃ©char - Bechar","station":"Station BÃ©char","commune":"Bechar","phone":["0671559677"]}},{"code":9,"label":"09 - البليدة","home":650,"office":400,"offices":[{"label":"Station Blida - Boufarik - Boufarik","station":"Station Blida - Boufarik","commune":"Boufarik","phone":["0770808317"]},{"label":"Station Blida - Blida","station":"Station Blida","commune":"Blida","phone":["0784602779","0770967048"]}]},{"code":10,"label":"10 - البويرة","home":650,"office":450,"offices":{"label":"Station Bouira - Bouira","station":"Station Bouira","commune":"Bouira","phone":["0770780702"]}},{"code":11,"label":"11 - تمنراست","home":1800,"office":1000,"offices":{"label":"Station Tamanrasset - Tamanrasset","station":"Station Tamanrasset","commune":"Tamanrasset","phone":["0770780713"]}},{"code":12,"label":"12 - تبسة","home":850,"office":450,"offices":{"label":"Station TÃ©bessa - Tebessa","station":"Station TÃ©bessa","commune":"Tebessa","phone":["0770507961"]}},{"code":13,"label":"13 - تلمسان","home":850,"office":450,"offices":[{"label":"Station Maghnia - Maghnia","station":"Station Maghnia","commune":"Maghnia","phone":["0770845020"]},{"label":"Station Tlemcen - Tlemcen","station":"Station Tlemcen","commune":"Tlemcen","phone":["0770451113"]}]},{"code":14,"label":"14 - تيارت","home":850,"office":450,"offices":{"label":"Station Tiaret - Tiaret","station":"Station Tiaret","commune":"Tiaret","phone":["0770750979"]}},{"code":15,"label":"15 - تيزي وزو","home":650,"office":450,"offices":[{"label":"Station Tizi Ouzou - Tizi Ouzou","station":"Station Tizi Ouzou","commune":"Tizi Ouzou","phone":["0795006815"]},{"label":"Station Azazga - Tizi Ouzou","station":"Station Azazga","commune":"Tizi Ouzou","phone":["0770898601"]},{"label":"Station Tizi Ouzou Nouvelle Ville - Tizi Ouzou","station":"Station Tizi Ouzou Nouvelle Ville","commune":"Tizi Ouzou","phone":["0563009791"]},{"label":"Station Boghni - Boghni","station":"Station Boghni","commune":"Boghni","phone":["0563009792"]}]},{"code":16,"label":"16 - الجزائر","home":450,"office":300,"offices":[{"label":"Station Alger Ain Naadja - Djasr Kasentina","station":"Station Alger Ain Naadja","commune":"Djasr Kasentina","phone":["0770531704"]},{"label":"Station Alger Draria - Draria","station":"Station Alger Draria","commune":"Draria","phone":["0771110157","0770808759"]},{"label":"Station Alger Ain Benian - Ain Benian","station":"Station Alger Ain Benian","commune":"Ain Benian","phone":["0770530775"]},{"label":"Station Alger Bab El Oued - Bab El Oued","station":"Station Alger Bab El Oued","commune":"Bab El Oued","phone":["0770845062"]},{"label":"Station Alger SacrÃ© Coeur - Alger Centre","station":"Station Alger SacrÃ© Coeur","commune":"Alger Centre","phone":["0770898643"]},{"label":"Station Alger Reghaia - Reghaia","station":"Station Alger Reghaia","commune":"Reghaia","phone":["0770012586"]},{"label":"Station Alger Eucalyptus - Les Eucalyptus","station":"Station Alger Eucalyptus","commune":"Les Eucalyptus","phone":["0770163989"]},{"label":"Station Alger Dely Brahim - Dely Ibrahim","station":"Station Alger Dely Brahim","commune":"Dely Ibrahim","phone":["0770530923"]},{"label":"Station Alger Oued Smar - Oued Smar","station":"Station Alger Oued Smar","commune":"Oued Smar","phone":["0770118225"]},{"label":"Station Alger Cheraga - Cheraga","station":"Station Alger Cheraga","commune":"Cheraga","phone":["0563009787"]},{"label":"Station Alger Kouba - Kouba","station":"Station Alger Kouba","commune":"Kouba","phone":["0770486105"]}]},{"code":17,"label":"17 - الجلفة","home":850,"office":450,"offices":[{"label":"Station Djelfa - Djelfa","station":"Station Djelfa","commune":"Djelfa","phone":["0770753611"]},{"label":"Station Djelfa - Ain Oussera - Ain Oussera","station":"Station Djelfa - Ain Oussera","commune":"Ain Oussera","phone":["0770953266"]}]},{"code":18,"label":"18 - جيجل","home":850,"office":450,"offices":{"label":"Station Jijel - Jijel","station":"Station Jijel","commune":"Jijel","phone":["0770976207"]}},{"code":19,"label":"19 - سطيف","home":850,"office":450,"offices":[{"label":"Station SÃ©tif - El Eulma - El Eulma","station":"Station SÃ©tif - El Eulma","commune":"El Eulma","phone":["0770521261"]},{"label":"Station Ain Azel - Ain Azel","station":"Station Ain Azel","commune":"Ain Azel","phone":["0770899367"]},{"label":"Station SÃ©tif - CitÃ© Bouaroua - Setif","station":"Station SÃ©tif - CitÃ© Bouaroua","commune":"Setif","phone":["0770898787"]},{"label":"Station SÃ©tif El Hidab - Setif","station":"Station SÃ©tif El Hidab","commune":"Setif","phone":["0770751080","0771823802"]},{"label":"Station SÃ©tif - Ain Oulmene - Ain Oulmane","station":"Station SÃ©tif - Ain Oulmene","commune":"Ain Oulmane","phone":["0770751081"]}]},{"code":20,"label":"20 - سعيدة","home":850,"office":450,"offices":{"label":"Station SaÃ¯da - Saida","station":"Station SaÃ¯da","commune":"Saida","phone":["0770751017"]}},{"code":21,"label":"21 - سكيكدة","home":850,"office":450,"offices":{"label":"Station Skikda - Skikda","station":"Station Skikda","commune":"Skikda","phone":["0770451085"]}},{"code":22,"label":"22 - سيدي بلعباس","home":850,"office":450,"offices":[{"label":"Station Telagh - Telagh","station":"Station Telagh","commune":"Telagh","phone":["0770164534"]},{"label":"Station Sidi Bel AbbÃ¨s - Sidi Bel Abbes","station":"Station Sidi Bel AbbÃ¨s","commune":"Sidi Bel Abbes","phone":["0770486538"]}]},{"code":23,"label":"23 - عنابة","home":850,"office":450,"offices":[{"label":"Station Annaba - Annaba","station":"Station Annaba","commune":"Annaba","phone":["0561869178","0770451061"]},{"label":"Station Annaba El Bouni - El Bouni","station":"Station Annaba El Bouni","commune":"El Bouni","phone":["0770773406","0770336039"]}]},{"code":24,"label":"24 - قالمة","home":850,"office":450,"offices":{"label":"Station Guelma - Guelma","station":"Station Guelma","commune":"Guelma","phone":["0772421972","0770520817"]}},{"code":25,"label":"25 - قسنطينة","home":850,"office":450,"offices":[{"label":"Station Constantine - Ali Mendjeli - El Khroub","station":"Station Constantine - Ali Mendjeli","commune":"El Khroub","phone":["0770911838"]},{"label":"Station Constantine - Sidi Mebrouk - Didouche Mourad","station":"Station Constantine - Sidi Mebrouk","commune":"Didouche Mourad","phone":["0770797329"]}]},{"code":26,"label":"26 - المدية","home":650,"office":450,"offices":{"label":"Station MÃ©dÃ©a - Medea","station":"Station MÃ©dÃ©a","commune":"Medea","phone":["0770797168","0770091207"]}},{"code":27,"label":"27 - مستغانم","home":850,"office":450,"offices":[{"label":"Station Mostaganem 2 - Mostaganem","station":"Station Mostaganem 2","commune":"Mostaganem","phone":["0770845070"]},{"label":"Station Mostaganem - Hadjadj","station":"Station Mostaganem","commune":"Hadjadj","phone":["0770371420"]}]},{"code":28,"label":"28 - المسيلة","home":850,"office":450,"offices":[{"label":"Station M\u0027Sila New - M\u0027sila","station":"Station M\u0027Sila New","commune":"M\u0027sila","phone":["0770164280"]},{"label":"Station M\u0027Sila - M\u0027Sila","station":"Station M\u0027Sila","commune":"M\u0027Sila","phone":[]},{"label":"Station BoussaÃ¢da - Bou Saada","station":"Station BoussaÃ¢da","commune":"Bou Saada","phone":["0778979623"]}]},{"code":29,"label":"29 - معسكر","home":850,"office":450,"offices":[{"label":"Station Mascara - Sig - Sig","station":"Station Mascara - Sig","commune":"Sig","phone":["0770797163"]},{"label":"Station Mascara - Mascara","station":"Station Mascara","commune":"Mascara","phone":["0770775964"]}]},{"code":30,"label":"30 - ورقلة","home":1000,"office":500,"offices":[{"label":"Station Ouargla - Ouargla","station":"Station Ouargla","commune":"Ouargla","phone":["0661186606"]},{"label":"Station Ouargla - Hassi Messaoud - Hassi Messaoud","station":"Station Ouargla - Hassi Messaoud","commune":"Hassi Messaoud","phone":["0674273120"]}]},{"code":31,"label":"31 - وهران","home":850,"office":450,"offices":[{"label":"Station Oran Es Senia (Maraval) - Es Senia","station":"Station Oran Es Senia (Maraval)","commune":"Es Senia","phone":["0770898647","0770898629"]},{"label":"Station Oran - Hai Sabah - Bir El Djir","station":"Station Oran - Hai Sabah","commune":"Bir El Djir","phone":["0770753696"]},{"label":"Station Oran Khemisti - Mers El Kebir","station":"Station Oran Khemisti","commune":"Mers El Kebir","phone":["0770163993","0770164228"]},{"label":"Station Oran Gambetta - Oran","station":"Station Oran Gambetta","commune":"Oran","phone":["0770911476"]}]},{"code":32,"label":"32 - البيض","home":850,"office":450,"offices":{"label":"Station El Bayadh - El Bayadh","station":"Station El Bayadh","commune":"El Bayadh","phone":["0675265384"]}},{"code":33,"label":"33 - إليزي","home":null,"office":null,"offices":[{"label":"Station Illizi - Illizi","station":"Station Illizi","commune":"Illizi","phone":["0791917907"]},{"label":"Station In Amenas - In Amenas","station":"Station In Amenas","commune":"In Amenas","phone":["0658305407"]}]},{"code":34,"label":"34 - برج بوعريريج","home":650,"office":450,"offices":{"label":"Station Bordj Bou Arreridj - Bordj Bou Arreridj","station":"Station Bordj Bou Arreridj","commune":"Bordj Bou Arreridj","phone":["0675553122"]}},{"code":35,"label":"35 - بومرداس","home":650,"office":400,"offices":[{"label":"Station BoumerdÃ¨s - Boumerdes","station":"Station BoumerdÃ¨s","commune":"Boumerdes","phone":["0770912531","0770898605"]},{"label":"Station Bordj Menaiel - Bordj Menaiel","station":"Station Bordj Menaiel","commune":"Bordj Menaiel","phone":["0770772556"]},{"label":"Station Dellys - Dellys","station":"Station Dellys","commune":"Dellys","phone":["0770912056"]}]},{"code":36,"label":"36 - الطارف","home":850,"office":550,"offices":[{"label":"Station El Tarf - El Tarf","station":"Station El Tarf","commune":"El Tarf","phone":[]},{"label":"Station El Tarf New - El Tarf","station":"Station El Tarf New","commune":"El Tarf","phone":["0652668097","0770936164"]}]},{"code":37,"label":"37 - تندوف","home":1650,"office":700,"offices":{}},{"code":38,"label":"38 - تيسمسيلت","home":850,"office":450,"offices":{"label":"Station Tissemsilt - Tissemsilt","station":"Station Tissemsilt","commune":"Tissemsilt","phone":["0672852152"]}},{"code":39,"label":"39 - الوادي","home":950,"office":600,"offices":{"label":"Station El Oued - El Oued","station":"Station El Oued","commune":"El Oued","phone":["0654707097","0770771833"]}},{"code":40,"label":"40 - خنشلة","home":850,"office":450,"offices":{"label":"Station Khenchela - Khenchela","station":"Station Khenchela","commune":"Khenchela","phone":["0770521072"]}},{"code":41,"label":"41 - سوق أهراس","home":850,"office":450,"offices":{"label":"Station Souk Ahras - Souk Ahras","station":"Station Souk Ahras","commune":"Souk Ahras","phone":["0770776689"]}},{"code":42,"label":"42 - تيبازة","home":650,"office":450,"offices":[{"label":"Station KolÃ©a - Kolea","station":"Station KolÃ©a","commune":"Kolea","phone":["0770912305"]},{"label":"Station Tipaza - Tipaza","station":"Station Tipaza","commune":"Tipaza","phone":["0770797338"]},{"label":"Station Hadjout - Hadjout","station":"Station Hadjout","commune":"Hadjout","phone":["0770807997"]}]},{"code":43,"label":"43 - ميلة","home":850,"office":450,"offices":[{"label":"Station Chelghoum LaÃ¯d - Chelghoum Laid","station":"Station Chelghoum LaÃ¯d","commune":"Chelghoum Laid","phone":["0770898639"]},{"label":"Station Mila - Mila","station":"Station Mila","commune":"Mila","phone":["0770738712"]}]},{"code":44,"label":"44 - عين الدفلى","home":650,"office":450,"offices":{"label":"Station AÃ¯n Defla - Ain Defla","station":"Station AÃ¯n Defla","commune":"Ain Defla","phone":["0770780589"]}},{"code":45,"label":"45 - النعامة","home":950,"office":500,"offices":{"label":"Station NaÃ¢ma - Mechria - Mecheria","station":"Station NaÃ¢ma - Mechria","commune":"Mecheria","phone":["0668426646"]}},{"code":46,"label":"46 - عين تموشنت","home":850,"office":450,"offices":[{"label":"Station AÃ¯n TÃ©mouchent - Beni Saf - Beni Saf","station":"Station AÃ¯n TÃ©mouchent - Beni Saf","commune":"Beni Saf","phone":["0770797349"]},{"label":"Station AÃ¯n TÃ©mouchent - Ain Temouchent","station":"Station AÃ¯n TÃ©mouchent","commune":"Ain Temouchent","phone":["0770868817"]}]},{"code":47,"label":"47 - غرداية","home":950,"office":650,"offices":{"label":"Station GhardaÃ¯a - Ghardaia","station":"Station GhardaÃ¯a","commune":"Ghardaia","phone":["0770531062","0770531289"]}},{"code":48,"label":"48 - غليزان","home":850,"office":450,"offices":[{"label":"Station Oued Rhiou - Oued Rhiou","station":"Station Oued Rhiou","commune":"Oued Rhiou","phone":["0770899295"]},{"label":"Station Relizane - Relizane","station":"Station Relizane","commune":"Relizane","phone":["0770783044"]}]},{"code":49,"label":"49 - تيميمون","home":1650,"office":850,"offices":{}},{"code":50,"label":"50 - برج باجي مختار","home":2000,"office":1200,"offices":{}},{"code":51,"label":"51 - أولاد جلال","home":950,"office":450,"offices":{"label":"Station Ouled Djellal - Ouled Djellal","station":"Station Ouled Djellal","commune":"Ouled Djellal","phone":["0550576439","0555132822"]}},{"code":52,"label":"52 - بني عباس","home":1300,"office":650,"offices":{}},{"code":53,"label":"53 - عين صالح","home":1650,"office":850,"offices":{"label":"Station In Salah - In Salah","station":"Station In Salah","commune":"In Salah","phone":["0670152552","0554006696"]}},{"code":54,"label":"54 - عين قزام","home":2000,"office":1200,"offices":{}},{"code":55,"label":"55 - تقرت","home":950,"office":500,"offices":{"label":"Station Touggourt - Touggourt","station":"Station Touggourt","commune":"Touggourt","phone":["0770999634","0697052872"]}},{"code":56,"label":"56 - جانت","home":null,"office":null,"offices":[{"label":"Station Djanet - Djanet","station":"Station Djanet","commune":"Djanet","phone":["0698502737"]},{"label":"Station Djanet New - Djanet","station":"Station Djanet New","commune":"Djanet","phone":["0698502737"]}]},{"code":57,"label":"57 - المغير","home":950,"office":500,"offices":{"label":"Station El M\u0027Ghair - El M\u0027ghair","station":"Station El M\u0027Ghair","commune":"El M\u0027ghair","phone":["0770898640"]}},{"code":58,"label":"58 - المنيعة","home":950,"office":500,"offices":{}}];
  var DELIVERY_BY_CODE = {};
  var PRODUCT_BY_ID = {};
  var CP1252_EXTRA_BYTES = {
    8364: 128,
    8218: 130,
    402: 131,
    8222: 132,
    8230: 133,
    8224: 134,
    8225: 135,
    710: 136,
    8240: 137,
    352: 138,
    8249: 139,
    338: 140,
    381: 142,
    8216: 145,
    8217: 146,
    8220: 147,
    8221: 148,
    8226: 149,
    8211: 150,
    8212: 151,
    732: 152,
    8482: 153,
    353: 154,
    8250: 155,
    339: 156,
    382: 158,
    376: 159
  };
  var UTF8_DECODER = typeof TextDecoder === 'function' ? new TextDecoder('utf-8') : null;

  function repairText(value) {
    var current = value;
    var attempts = 0;

    while (typeof current === 'string' && /[ÃØÙÂâ\u0192\u02C6\u02DC\u2013\u2014\u2018-\u201E\u2020-\u2022\u2026\u2030\u2039\u203A\u0152\u0153\u0160\u0161\u0178\u017D\u017E]/.test(current) && attempts < 2) {
      try {
        if (!UTF8_DECODER) {
          break;
        }

        var bytes = [];
        var index = 0;
        for (; index < current.length; index += 1) {
          var code = current.charCodeAt(index);

          if (code <= 255) {
            bytes.push(code);
            continue;
          }

          if (CP1252_EXTRA_BYTES[code]) {
            bytes.push(CP1252_EXTRA_BYTES[code]);
            continue;
          }

          bytes = [];
          break;
        }

        if (!bytes.length) {
          break;
        }

        var repaired = UTF8_DECODER.decode(new Uint8Array(bytes));
        if (repaired === current) {
          break;
        }

        current = repaired;
        attempts += 1;
      } catch (error) {
        break;
      }
    }

    return current;
  }

  function repairCopyTree(value) {
    if (Array.isArray(value)) {
      return value.map(repairCopyTree);
    }

    if (value && typeof value === 'object') {
      Object.keys(value).forEach(function (key) {
        value[key] = repairCopyTree(value[key]);
      });
      return value;
    }

    return typeof value === 'string' ? repairText(value) : value;
  }

  function isLocalCopyPreviewPage() {
    var pathname = (window.location && window.location.pathname ? window.location.pathname : '').replace(/\\/g, '/');
    return /\/marketing\/curio-copy-editor\.html$/i.test(pathname);
  }

  function isCopyEditorMode() {
    try {
      var search = new URLSearchParams(window.location.search || '');
      return search.get('curio-edit') === '1' || isLocalCopyPreviewPage();
    } catch (error) {
      return isLocalCopyPreviewPage();
    }
  }

  function mergeInto(target, source) {
    if (!source || typeof source !== 'object') {
      return target;
    }

    Object.keys(source).forEach(function (key) {
      var sourceValue = source[key];
      if (Array.isArray(sourceValue)) {
        target[key] = sourceValue.slice();
        return;
      }

      if (sourceValue && typeof sourceValue === 'object') {
        if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
          target[key] = {};
        }
        mergeInto(target[key], sourceValue);
        return;
      }

      target[key] = sourceValue;
    });

    return target;
  }

  function getCopyDraftKey() {
    return 'curio-copy-draft-v1';
  }

  function loadCopyDraft() {
    if (!isCopyEditorMode() || !window.localStorage) {
      return;
    }

    try {
      var raw = window.localStorage.getItem(getCopyDraftKey());
      if (!raw) {
        return;
      }
      var parsed = JSON.parse(raw);
      mergeInto(STORE_COPY, parsed);
    } catch (error) {
      // Ignore malformed drafts and fall back to defaults.
    }
  }

  function persistCopyDraft() {
    if (!isCopyEditorMode() || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.setItem(getCopyDraftKey(), JSON.stringify(STORE_COPY));
    } catch (error) {
      // Ignore storage errors in preview mode.
    }
  }

  function clearCopyDraft() {
    if (!window.localStorage) {
      return;
    }

    try {
      window.localStorage.removeItem(getCopyDraftKey());
    } catch (error) {
      // Ignore storage errors in preview mode.
    }
  }

  function getCopyValueByPath(path) {
    return String(path || '').split('.').reduce(function (current, key) {
      if (current == null) {
        return undefined;
      }
      return current[key];
    }, STORE_COPY);
  }

  function setCopyValueByPath(path, value) {
    var keys = String(path || '').split('.');
    var target = STORE_COPY;
    var index = 0;

    for (; index < keys.length - 1; index += 1) {
      if (!target[keys[index]] || typeof target[keys[index]] !== 'object') {
        target[keys[index]] = {};
      }
      target = target[keys[index]];
    }

    target[keys[keys.length - 1]] = value;
  }

  function hasText(value) {
    return typeof value === 'string' ? value.trim().length > 0 : !!value;
  }

  function shouldRenderCopyValue(value) {
    return hasText(value) || isCopyEditorMode();
  }

  function injectCopyEditorStyles() {
    if (document.getElementById('curio-copy-editor-style')) {
      return;
    }

    var style = document.createElement('style');
    style.id = 'curio-copy-editor-style';
    style.textContent = [
      '[data-curio-copy-path]{position:relative}',
      '.curio-copy-editable{outline:2px dashed rgba(69,123,157,.28);outline-offset:4px;cursor:text;transition:outline-color .15s ease,background-color .15s ease}',
      '.curio-copy-editable:hover,.curio-copy-editable:focus{outline-color:#457b9d;background:rgba(69,123,157,.06)}',
      '.curio-copy-editable[contenteditable="true"]{min-width:1ch}',
      '#curio-copy-editor{position:fixed;left:16px;bottom:16px;z-index:2147483647;width:min(320px,calc(100vw - 32px));display:grid;gap:10px;padding:16px;border-radius:18px;background:rgba(33,22,47,.94);color:#fff;box-shadow:0 24px 48px rgba(0,0,0,.28);font-family:"Tajawal",sans-serif}',
      '#curio-copy-editor h3{margin:0;font-size:1.05rem;font-weight:900}',
      '#curio-copy-editor p{margin:0;color:rgba(255,255,255,.78);line-height:1.7;font-size:.9rem}',
      '#curio-copy-editor code{font-family:ui-monospace,monospace;font-size:.82rem;background:rgba(255,255,255,.12);padding:2px 6px;border-radius:8px}',
      '.curio-copy-editor-actions{display:flex;gap:8px;flex-wrap:wrap}',
      '.curio-copy-editor-actions button{appearance:none;border:0;border-radius:12px;min-height:42px;padding:0 14px;font:inherit;font-weight:800;cursor:pointer}',
      '.curio-copy-copy{background:#f5cb48;color:#21162f}',
      '.curio-copy-reset{background:rgba(255,255,255,.12);color:#fff}',
      '.curio-copy-editor-status{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.08);line-height:1.7;font-size:.88rem;color:rgba(255,255,255,.9)}'
    ].join('');
    document.head.appendChild(style);
  }

  function attachCopyEditor() {
    if (!isCopyEditorMode() || document.getElementById('curio-copy-editor')) {
      return;
    }

    injectCopyEditorStyles();

    var statusText = 'بدل النصوص مباشرة من الصفحة. التعديلات تتخزن محليا فقط حتى توافق عليها.';
    var panel = document.createElement('aside');
    panel.id = 'curio-copy-editor';
    panel.innerHTML = [
      '<h3>Curio Copy Editor</h3>',
      '<p>بدل أي نص عليه إطار أزرق. من بعد استعمل <code>نسخ النصوص</code> وبعثلي النسخة النهائية.</p>',
      '<div class="curio-copy-editor-actions">',
      '  <button class="curio-copy-copy" type="button">نسخ النصوص</button>',
      '  <button class="curio-copy-reset" type="button">مسح التعديلات</button>',
      '</div>',
      '<div class="curio-copy-editor-status">' + statusText + '</div>'
    ].join('');

    var copyButton = panel.querySelector('.curio-copy-copy');
    var resetButton = panel.querySelector('.curio-copy-reset');
    var status = panel.querySelector('.curio-copy-editor-status');

    function setStatus(text) {
      status.textContent = text;
    }

    document.body.appendChild(panel);

    Array.from(document.querySelectorAll('[data-curio-copy-path]')).forEach(function (element) {
      element.classList.add('curio-copy-editable');
      element.setAttribute('contenteditable', 'true');
      element.setAttribute('spellcheck', 'false');
      element.setAttribute('title', element.getAttribute('data-curio-copy-path'));

      element.addEventListener('input', function () {
        var path = element.getAttribute('data-curio-copy-path');
        var value = element.textContent.replace(/\u00A0/g, ' ').trim();
        setCopyValueByPath(path, value);
        persistCopyDraft();
        setStatus('تبدل: ' + path);
      });
    });

    copyButton.addEventListener('click', function () {
      var text = JSON.stringify(STORE_COPY, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          setStatus('تم نسخ النصوص. ابعثهالي ونطبقها في YouCan.');
        }).catch(function () {
          setStatus('النسخ الأوتوماتيكي ما خدمش. نقدر نزيدلك زر تصدير إذا احتجت.');
        });
        return;
      }

      setStatus('المتصفح ما سمحش بالنسخ الأوتوماتيكي.');
    });

    resetButton.addEventListener('click', function () {
      clearCopyDraft();
      window.location.reload();
    });

    document.addEventListener('submit', function (event) {
      if (!event.target.closest('#curio-copy-editor')) {
        event.preventDefault();
      }
    }, true);

    document.addEventListener('click', function (event) {
      if (event.target.closest('#curio-copy-editor')) {
        return;
      }
      var link = event.target.closest('a[href]');
      if (link) {
        event.preventDefault();
      }
    }, true);
  }

  function normalizeProducts() {
    Object.keys(PRODUCT_CATALOG).forEach(function (key) {
      PRODUCT_CATALOG[key].label = repairText(PRODUCT_CATALOG[key].label);
      PRODUCT_BY_ID[PRODUCT_CATALOG[key].id] = PRODUCT_CATALOG[key];
    });
  }

  function normalizeDeliveryData() {
    DELIVERY_DATA.forEach(function (record) {
      record.label = repairText(record.label);
      var offices = record && record.offices ? record.offices : [];
      if (!Array.isArray(offices)) {
        offices = Object.keys(offices).length ? [offices] : [];
      }

      record.offices = offices
        .filter(function (office) {
          return office && office.label;
        })
        .map(function (office) {
          return {
            value: repairText(office.label),
            label: repairText(office.label),
            station: repairText(office.station || office.label),
            commune: repairText(office.commune || ''),
            phone: Array.isArray(office.phone) ? office.phone : office.phone ? [office.phone] : []
          };
        })
        .sort(function (left, right) {
          return left.label.localeCompare(right.label, 'ar');
        });

      record.hasFees = typeof record.home === 'number' && typeof record.office === 'number';
      DELIVERY_BY_CODE[String(record.code)] = record;
    });
  }

  function loadFont() {
    if (document.querySelector('link[data-curio-font="tajawal"]')) {
      return;
    }

    var fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap';
    fontLink.rel = 'stylesheet';
    fontLink.setAttribute('data-curio-font', 'tajawal');
    document.head.appendChild(fontLink);
  }

  function injectStyles() {
    if (document.getElementById('curio-checkout-enhancements-style')) {
      return;
    }

    var style = document.createElement('style');
    style.id = 'curio-checkout-enhancements-style';
    style.textContent = [
      '.curio-delivery-panel{margin-top:18px;padding:18px;border:1px solid rgba(33,22,47,.1);border-radius:18px;background:rgba(255,255,255,.95);box-shadow:0 16px 30px rgba(33,22,47,.06)}',
      '.curio-delivery-panel h3{margin:0 0 10px;font-family:"Tajawal",sans-serif;font-size:1.05rem;font-weight:800;color:#21162f}',
      '.curio-field{display:grid;gap:8px;margin-top:14px}',
      '.curio-field label{font-weight:700;color:#21162f;font-size:.95rem}',
      '.curio-field input,.curio-field select,.curio-field textarea{width:100%;min-height:48px;padding:12px 14px;border-radius:14px;border:1px solid rgba(33,22,47,.14);background:#fff;color:#21162f;outline:none;transition:border-color .15s ease,box-shadow .15s ease}',
      '.curio-field textarea{min-height:92px;resize:vertical}',
      '.curio-field input:focus,.curio-field select:focus,.curio-field textarea:focus{border-color:#457b9d;box-shadow:0 0 0 4px rgba(69,123,157,.12)}',
      '.curio-field.is-invalid input,.curio-field.is-invalid select,.curio-field.is-invalid textarea{border-color:#e5424d;box-shadow:0 0 0 4px rgba(229,66,77,.1)}',
      '.curio-field-note{margin:0;color:#675874;font-size:.87rem;line-height:1.6}',
      '.curio-mode-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:6px}',
      '.curio-mode-option{display:block;cursor:pointer}',
      '.curio-mode-option input{position:absolute;opacity:0;pointer-events:none}',
      '.curio-mode-option span{display:grid;gap:4px;min-height:100%;padding:14px;border-radius:14px;border:1px solid rgba(33,22,47,.12);background:rgba(255,255,255,.92);transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease}',
      '.curio-mode-option small{color:#675874;line-height:1.5}',
      '.curio-mode-option input:checked + span{border-color:#457b9d;box-shadow:0 12px 24px rgba(69,123,157,.16);transform:translateY(-1px)}',
      '.curio-summary{display:grid;gap:10px;margin-top:16px;padding:16px;border-radius:16px;background:linear-gradient(180deg,rgba(69,123,157,.07),rgba(245,203,72,.12));border:1px solid rgba(33,22,47,.08)}',
      '.curio-summary-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:700}',
      '.curio-summary-row span:last-child{text-align:left;white-space:nowrap}',
      '.curio-summary-row.total{padding-top:10px;border-top:1px dashed rgba(33,22,47,.18);font-size:1rem}',
      '.curio-message{display:none;margin-top:14px;padding:12px 14px;border-radius:14px;font-weight:700;line-height:1.6}',
      '.curio-message.is-error{display:block;background:rgba(229,66,77,.09);border:1px solid rgba(229,66,77,.18);color:#b52c35}',
      '.curio-message.is-info{display:block;background:rgba(69,123,157,.08);border:1px solid rgba(69,123,157,.16);color:#457b9d}',
      '.curio-message.is-success{display:block;background:rgba(30,159,98,.09);border:1px solid rgba(30,159,98,.16);color:#10643d}',
      '.curio-hidden{display:none!important}',
      '.curio-scroll-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 22px;border-radius:14px;border:none;background:linear-gradient(135deg,#e5424d,#c53039);color:#fff;font-family:"Tajawal",sans-serif;font-weight:800;cursor:pointer;box-shadow:0 16px 30px rgba(229,66,77,.22)}',
      '.curio-product-inline-note{margin-top:10px;color:#675874;font-size:.88rem;line-height:1.6}',
      '@media(max-width:767px){.curio-mode-grid{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(style);
  }

  function injectHomePageStyles() {
    if (document.getElementById('curio-storefront-home-style')) {
      return;
    }

    var style = document.createElement('style');
    style.id = 'curio-storefront-home-style';
    style.textContent = [
      'body.curio-home-body{margin:0;background:linear-gradient(180deg,#fff8f0 0%,#f7efe6 100%);color:#21162f;font-family:"Tajawal",sans-serif}',
      'body.curio-home-body *{box-sizing:border-box}',
      '.curio-home-wrap{min-height:100vh}',
      '.curio-home-strip{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;padding:14px 18px;background:linear-gradient(90deg,#e5424d,#c53039);color:#fff;font-weight:800;font-size:.95rem}',
      '.curio-home-shell{width:min(calc(100% - 28px),1180px);margin:0 auto;padding:28px 0 56px}',
      '.curio-home-hero,.curio-home-order,.curio-home-card,.curio-home-note{border:1px solid rgba(33,22,47,.08);border-radius:26px;background:rgba(255,255,255,.9);box-shadow:0 18px 36px rgba(33,22,47,.08)}',
      '.curio-home-hero{padding:0;overflow:hidden;background:radial-gradient(circle at top right,rgba(245,203,72,.28),transparent 36%),linear-gradient(180deg,rgba(255,255,255,.96),rgba(255,248,240,.96))}',
      '.curio-home-hero-grid{display:grid;gap:20px;align-items:stretch}',
      '.curio-home-hero-copy{padding:28px}',
      '.curio-home-kicker{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(33,22,47,.06);font-weight:800;font-size:.85rem}',
      '.curio-home-title{margin:16px 0 12px;font-size:clamp(2rem,6vw,3.6rem);line-height:1.06;font-weight:900}',
      '.curio-home-lead{margin:0;max-width:58ch;color:#675874;line-height:1.9;font-size:1rem}',
      '.curio-home-hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}',
      '.curio-home-hero-media{position:relative;min-height:280px;margin:0 28px 28px;border-radius:24px;overflow:hidden;background:#e9dfd0;box-shadow:0 18px 36px rgba(33,22,47,.12)}',
      '.curio-home-hero-media::after{content:"";position:absolute;inset:auto 0 0;height:42%;background:linear-gradient(180deg,transparent,rgba(33,22,47,.18));pointer-events:none}',
      '.curio-home-hero-media img{display:block;width:100%;height:100%;object-fit:cover}',
      '.curio-home-hero-note{position:absolute;right:18px;bottom:18px;display:grid;gap:4px;padding:12px 14px;border-radius:18px;background:rgba(255,255,255,.9);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.72);box-shadow:0 16px 30px rgba(33,22,47,.14);z-index:1}',
      '.curio-home-hero-note strong{font-size:1rem;font-weight:900}',
      '.curio-home-hero-note span{color:#675874;font-size:.88rem;font-weight:700}',
      '.curio-home-btn,.curio-home-ghost{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 20px;border-radius:16px;font-weight:800;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease}',
      '.curio-home-btn{background:linear-gradient(135deg,#21162f,#3a2650);color:#fff;box-shadow:0 16px 30px rgba(33,22,47,.18)}',
      '.curio-home-ghost{background:rgba(255,255,255,.85);color:#21162f;border:1px solid rgba(33,22,47,.12)}',
      '.curio-home-badges{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}',
      '.curio-home-badge{padding:9px 12px;border-radius:999px;background:rgba(69,123,157,.1);color:#335a73;font-weight:700;font-size:.92rem}',
      '.curio-home-order{margin-top:22px;padding:24px;position:relative;overflow:hidden}',
      '.curio-home-order::before{content:"";position:absolute;inset:auto auto -90px -70px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(245,203,72,.24),transparent 68%);pointer-events:none}',
      '.curio-home-order h2{margin:0 0 8px;font-size:1.65rem;font-weight:900}',
      '.curio-home-order > p{margin:0 0 18px;color:#675874;line-height:1.8}',
      '.curio-home-form{display:grid;gap:14px;position:relative;z-index:1}',
      '.curio-home-field{display:grid;gap:8px}',
      '.curio-home-field label,.curio-home-form legend{font-size:.95rem;font-weight:800}',
      '.curio-home-field-note{margin:0;color:#675874;font-size:.87rem;line-height:1.6}',
      '.curio-home-form fieldset{margin:0;padding:0;border:0}',
      '.curio-home-form select,.curio-home-form input,.curio-home-form textarea{width:100%;min-height:52px;padding:14px 16px;border-radius:16px;border:1px solid rgba(33,22,47,.12);background:rgba(255,255,255,.95);color:#21162f;font:inherit;outline:none;transition:border-color .15s ease,box-shadow .15s ease}',
      '.curio-home-form textarea{min-height:110px;resize:vertical}',
      '.curio-home-form select:focus,.curio-home-form input:focus,.curio-home-form textarea:focus{border-color:#457b9d;box-shadow:0 0 0 4px rgba(69,123,157,.12)}',
      '.curio-home-modes{display:grid;gap:10px;grid-template-columns:repeat(2,minmax(0,1fr))}',
      '.curio-home-mode{display:block;cursor:pointer}',
      '.curio-home-mode input{position:absolute;opacity:0;pointer-events:none}',
      '.curio-home-mode span{display:grid;gap:4px;min-height:100%;padding:14px;border-radius:16px;border:1px solid rgba(33,22,47,.12);background:rgba(255,255,255,.9);transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease}',
      '.curio-home-mode small{color:#675874;line-height:1.6}',
      '.curio-home-mode input:checked + span{border-color:#457b9d;box-shadow:0 12px 24px rgba(69,123,157,.16);transform:translateY(-1px)}',
      '.curio-home-summary{display:grid;gap:10px;padding:16px;border-radius:18px;background:linear-gradient(180deg,rgba(69,123,157,.08),rgba(245,203,72,.14));border:1px solid rgba(33,22,47,.08)}',
      '.curio-home-summary-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:800}',
      '.curio-home-summary-row span:last-child{text-align:left;white-space:nowrap}',
      '.curio-home-summary-row.total{padding-top:10px;border-top:1px dashed rgba(33,22,47,.16);font-size:1rem}',
      '.curio-home-summary-note{color:#675874;line-height:1.7;font-size:.92rem}',
      '.curio-home-submit{position:sticky;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:8;width:100%;min-height:58px;border:0;border-radius:18px;background:linear-gradient(135deg,#e5424d,#c53039);color:#fff;font:inherit;font-weight:900;cursor:pointer;box-shadow:0 18px 34px rgba(229,66,77,.22)}',
      '.curio-home-submit.is-loading{opacity:.76;pointer-events:none}',
      '.curio-home-cards{display:grid;gap:18px;margin-top:22px}',
      '.curio-home-card{padding:20px;display:grid;gap:14px;transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease}',
      '.curio-home-card.is-selected{border-color:#457b9d;box-shadow:0 18px 36px rgba(69,123,157,.16);transform:translateY(-2px)}',
      '.curio-home-card-media{position:relative;overflow:hidden;border-radius:20px;aspect-ratio:4 / 4.8;background:linear-gradient(180deg,#efe7dd,#e4d7c8)}',
      '.curio-home-card-media img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .22s ease}',
      '.curio-home-card:hover .curio-home-card-media img{transform:scale(1.03)}',
      '.curio-home-card-top{display:flex;justify-content:space-between;gap:16px;align-items:start}',
      '.curio-home-card h3{margin:0;font-size:1.4rem;font-weight:900}',
      '.curio-home-card p{margin:0;color:#675874;line-height:1.8}',
      '.curio-home-price{display:grid;gap:4px;justify-items:end;text-align:left}',
      '.curio-home-price strong{font-size:1.3rem;font-weight:900}',
      '.curio-home-price s{color:#8b7d98;font-weight:700}',
      '.curio-home-tags{display:flex;gap:8px;flex-wrap:wrap}',
      '.curio-home-tag{padding:8px 10px;border-radius:999px;background:rgba(33,22,47,.06);font-size:.86rem;font-weight:700;color:#51435f}',
      '.curio-home-card-actions{display:flex;gap:10px;flex-wrap:wrap}',
      '.curio-home-card-actions button,.curio-home-card-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 16px;border-radius:14px;font:inherit;font-weight:800;text-decoration:none}',
      '.curio-home-card-actions button{border:0;background:#21162f;color:#fff;cursor:pointer}',
      '.curio-home-card-actions a{border:1px solid rgba(33,22,47,.12);background:rgba(255,255,255,.92);color:#21162f}',
      '.curio-home-card-actions > :only-child{width:100%}',
      '.curio-home-note{margin-top:18px;padding:18px;display:grid;gap:12px}',
      '.curio-home-note-grid{display:grid;gap:12px}',
      '.curio-home-note-item strong{display:block;margin-bottom:4px;font-weight:900}',
      '.curio-home-note-item p{margin:0;color:#675874;line-height:1.7}',
      '.curio-home-field.is-hidden{display:none!important}',
      '.curio-home-foot{margin-top:22px;color:#675874;font-size:.92rem;text-align:center;line-height:1.8}',
      '@media(min-width:980px){.curio-home-hero-grid{grid-template-columns:minmax(0,1fr) minmax(280px,.88fr)}.curio-home-cards{grid-template-columns:repeat(3,minmax(0,1fr))}.curio-home-note-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.curio-home-hero-media{margin:28px 28px 28px 0;min-height:100%}}',
      '@media(max-width:979px){.curio-home-shell{padding-top:20px}.curio-home-cards{grid-template-columns:1fr}}',
      '@media(max-width:700px){.curio-home-shell{width:min(calc(100% - 20px),1180px)}.curio-home-hero,.curio-home-order,.curio-home-card,.curio-home-note{border-radius:22px}.curio-home-modes{grid-template-columns:1fr}.curio-home-card-top{display:grid}.curio-home-price{justify-items:start;text-align:right}.curio-home-hero-copy{padding:22px}.curio-home-hero-media{margin:0 22px 22px;min-height:240px}.curio-home-hero-note{left:14px;right:14px;bottom:14px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function formatDA(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      return '--';
    }

    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' DA';
  }

  function sanitizePhone(phone) {
    return (phone || '').replace(/[^0-9]/g, '').slice(0, 10);
  }

  function isValidPhone(phone) {
    return /^0[567][0-9]{8}$/.test(sanitizePhone(phone));
  }

  function showMessage(element, type, text) {
    if (!element) {
      return;
    }

    element.className = 'curio-message is-' + type;
    element.textContent = repairText(text);
  }

  function clearMessage(element) {
    if (!element) {
      return;
    }

    element.className = 'curio-message';
    element.textContent = '';
  }

  function setFieldInvalid(wrapper, invalid) {
    if (!wrapper) {
      return;
    }

    wrapper.classList.toggle('is-invalid', !!invalid);
  }

  function getSelectedMode(root) {
    var checked = root.querySelector('input[name="delivery_mode"]:checked');
    return checked ? checked.value : 'home';
  }

  function getDeliveryRecordByLabel(value) {
    if (!value) {
      return null;
    }

    var codeMatch = String(value).match(/^(\d{1,2})\s*-/);
    if (!codeMatch) {
      return null;
    }

    return DELIVERY_BY_CODE[String(parseInt(codeMatch[1], 10))] || null;
  }

  function populateWilayaSelect(select, selectedValue) {
    if (!select) {
      return;
    }

    var placeholder = repairText(select.getAttribute('data-curio-placeholder') || STORE_COPY.common.placeholders.wilaya);
    select.innerHTML = '';

    var firstOption = document.createElement('option');
    firstOption.value = '';
    firstOption.textContent = placeholder;
    select.appendChild(firstOption);

    DELIVERY_DATA.forEach(function (record) {
      var option = document.createElement('option');
      option.value = record.label;
      option.textContent = record.label;
      select.appendChild(option);
    });

    if (selectedValue) {
      select.value = selectedValue;
    }
  }

  function populateOfficeSelect(select, record, selectedValue) {
    if (!select) {
      return;
    }

    select.innerHTML = '';

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = repairText(record ? STORE_COPY.common.placeholders.office : STORE_COPY.common.placeholders.officeBeforeWilaya);
    select.appendChild(placeholder);

    if (!record) {
      select.disabled = true;
      return;
    }

    record.offices.forEach(function (office) {
      var option = document.createElement('option');
      option.value = office.value;
      option.textContent = office.label;
      select.appendChild(option);
    });

    select.disabled = record.offices.length === 0;

    if (selectedValue) {
      select.value = selectedValue;
    }
  }

  function buildExtraPayload(product, record, mode, address, officeLabel) {
    var total = record && record.hasFees ? product.price + (mode === 'office' ? record.office : record.home) : null;
    var lines = [
      repairText('Ø§Ù„Ù…Ù†ØªØ¬') + ': ' + product.label,
      repairText('Ù†ÙˆØ¹ Ø§Ù„ØªÙˆØµÙŠÙ„') + ': ' + repairText(mode === 'office' ? 'Ù„Ù„Ù…ÙƒØªØ¨' : 'Ù„Ù„Ø¯Ø§Ø±'),
      repairText('Ø§Ù„ÙˆÙ„Ø§ÙŠØ©') + ': ' + (record ? record.label : repairText('ØºÙŠØ± Ù…Ø­Ø¯Ø¯Ø©'))
    ];

    if (mode === 'office') {
      lines.push(repairText('Ø§Ù„Ù…ÙƒØªØ¨') + ': ' + (officeLabel || repairText('ØºÙŠØ± Ù…Ø­Ø¯Ø¯')));
    } else {
      lines.push(repairText('Ø§Ù„Ø¹Ù†ÙˆØ§Ù†') + ': ' + (address || repairText('ØºÙŠØ± Ù…Ø­Ø¯Ø¯')));
    }

    lines.push(repairText('Ø«Ù…Ù† Ø§Ù„ØªÙˆØµÙŠÙ„') + ': ' + (record && record.hasFees ? formatDA(mode === 'office' ? record.office : record.home) : repairText('ØºÙŠØ± Ù…ØªÙˆÙØ±')));
    lines.push(repairText('Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶') + ': ' + (typeof total === 'number' ? formatDA(total) : repairText('ØºÙŠØ± Ù…ØªÙˆÙØ±')));

    return lines.join('\n');
  }

  function getProductByKey(key) {
    return PRODUCT_CATALOG[key] || PRODUCT_CATALOG.goul;
  }

  function getProductById(id) {
    return PRODUCT_BY_ID[id] || null;
  }

  function bindPhoneInput(input, wrapper, messageElement) {
    if (!input || input.dataset.curioPhoneBound === 'true') {
      return;
    }

    input.dataset.curioPhoneBound = 'true';
    input.setAttribute('maxlength', '10');
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('pattern', '0[567][0-9]{8}');
    input.setAttribute('aria-label', repairText(STORE_COPY.common.labels.phone));

    input.addEventListener('input', function () {
      input.value = sanitizePhone(input.value);

      if (!input.value) {
        setFieldInvalid(wrapper, false);
        clearMessage(messageElement);
        return;
      }

      if (isValidPhone(input.value)) {
        setFieldInvalid(wrapper, false);
        if (messageElement && messageElement.classList.contains('is-error')) {
          clearMessage(messageElement);
        }
        return;
      }

      setFieldInvalid(wrapper, true);
    });
  }

  function enhanceCommonPagePolish() {
    var nameInputs = document.querySelectorAll('input[name="first_name"]');
    nameInputs.forEach(function (input) {
      input.setAttribute('aria-label', repairText(STORE_COPY.common.labels.name));
      input.required = true;
    });

    var headings = document.querySelectorAll('.html-editor-section h1, .html-editor-section h2');
    headings.forEach(function (heading) {
      heading.style.fontFamily = "'Tajawal', sans-serif";
    });

    var grayElements = document.querySelectorAll('.html-editor-section [style]');
    grayElements.forEach(function (element) {
      if (element.style.color === 'rgb(102, 102, 102)') {
        element.style.color = 'rgb(100, 80, 130)';
      }
    });

    var images = document.querySelectorAll('.html-editor-section img');
    images.forEach(function (image, index) {
      if (index > 0) {
        image.loading = 'lazy';
      }
    });

    var valueSpan = document.querySelector('.express-checkout-form-section .product-price .value');
    if (valueSpan && valueSpan.textContent.indexOf('2390') > -1) {
      valueSpan.textContent = valueSpan.textContent.replace(/2390/g, '2,390');
    }

    var priceSpan = document.querySelector('.express-checkout-form-section .product-price');
    if (priceSpan && priceSpan.textContent.indexOf('2390') > -1) {
      priceSpan.innerHTML = priceSpan.innerHTML.replace(/2390/g, '2,390');
    }

    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      if (!link.rel || link.rel.indexOf('noopener') === -1) {
        link.rel = 'noopener noreferrer';
      }
    });

    var ctaNeedle = repairText(STORE_COPY.common.scrollCta.needle);
    var targetText = Array.from(document.querySelectorAll('.html-editor-section p')).find(function (paragraph) {
      return paragraph.textContent.indexOf(ctaNeedle) > -1;
    });

    if (targetText && !targetText.dataset.curioScrollCta) {
      var button = document.createElement('button');
      button.type = 'button';
      button.dataset.curioScrollCta = 'true';
      button.className = 'curio-scroll-btn';
      button.textContent = repairText(STORE_COPY.common.scrollCta.label);
      button.addEventListener('click', function () {
        var target = document.getElementById('curio-home-order') || document.querySelector('#express-checkout-form input[name="first_name"]');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (typeof target.focus === 'function') {
            setTimeout(function () {
              target.focus();
            }, 300);
          }
        }
      });
      targetText.parentNode.replaceChild(button, targetText);
    }
  }

  function isStoreHomePage() {
    var pathname = (window.location && window.location.pathname ? window.location.pathname : '/').replace(/\/+$/, '');
    return pathname === '' || pathname === '/' || isLocalCopyPreviewPage();
  }

  function buildHomeCard(product, cardCopy, viewPageLabel) {
    var cardPath = 'home.cards.' + product.key;
    var viewPageMarkup = shouldRenderCopyValue(viewPageLabel)
      ? '    <a href="' + product.url + '"><span data-curio-copy-path="home.viewPageLabel">' + (viewPageLabel || '') + '</span></a>'
      : '';

    return [
      '<article class="curio-home-card" data-curio-product-card="' + product.key + '">',
      product.cover ? '  <div class="curio-home-card-media"><img src="' + product.cover + '" alt="' + (product.coverAlt || product.label) + '" loading="lazy" style="object-position:' + (product.cardPosition || 'center center') + '"></div>' : '',
      '  <div class="curio-home-card-top">',
      '    <div>',
      '      <h3>' + product.label + '</h3>',
      '      <p data-curio-copy-path="' + cardPath + '.description">' + cardCopy.description + '</p>',
      '    </div>',
      '    <div class="curio-home-price">',
      product.compareAt ? '      <s>' + formatDA(product.compareAt) + '</s>' : '',
      '      <strong>' + formatDA(product.price) + '</strong>',
      '    </div>',
      '  </div>',
      '  <div class="curio-home-tags">' + cardCopy.tags.map(function (tag, index) {
        return '<span class="curio-home-tag" data-curio-copy-path="' + cardPath + '.tags.' + index + '">' + tag + '</span>';
      }).join('') + '</div>',
      '  <div class="curio-home-card-actions">',
      '    <button type="button" data-curio-pick="' + product.key + '"><span data-curio-copy-path="' + cardPath + '.primary">' + cardCopy.primary + '</span></button>',
           viewPageMarkup,
      '  </div>',
      '</article>'
    ].join('');
  }

  function renderStoreHomePage() {
    if (!isStoreHomePage() || document.getElementById('curio-home-shell')) {
      return;
    }

    injectHomePageStyles();

    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    document.title = 'Curio | ألعاب كارط جزائرية';
    document.body.className = 'curio-home-body';

    var goul = getProductByKey('goul');
    var roubla = getProductByKey('roubla');
    var bundle = getProductByKey('bundle');
    var homeCopy = STORE_COPY.home;
    var stripMarkup = homeCopy.strip.map(function (item, index) {
      if (!shouldRenderCopyValue(item)) {
        return '';
      }
      return '    <span data-curio-copy-path="home.strip.' + index + '">' + (item || '') + '</span>';
    }).join('');
    var showPriceBadges = !(homeCopy.badges && homeCopy.badges.hidePrices);
    var badgeMarkup = '';
    if (showPriceBadges) {
      badgeMarkup = [
        '              <span class="curio-home-badge">' + formatDA(goul.price) + (hasText(homeCopy.badges.singleSuffix) ? ' <span data-curio-copy-path="home.badges.singleSuffix">' + homeCopy.badges.singleSuffix + '</span>' : '') + (shouldRenderCopyValue(homeCopy.badges.singleSuffix) && !hasText(homeCopy.badges.singleSuffix) ? '<span data-curio-copy-path="home.badges.singleSuffix"></span>' : '') + '</span>',
        '              <span class="curio-home-badge">' + formatDA(bundle.price) + (hasText(homeCopy.badges.bundleSuffix) ? ' <span data-curio-copy-path="home.badges.bundleSuffix">' + homeCopy.badges.bundleSuffix + '</span>' : '') + (shouldRenderCopyValue(homeCopy.badges.bundleSuffix) && !hasText(homeCopy.badges.bundleSuffix) ? '<span data-curio-copy-path="home.badges.bundleSuffix"></span>' : '') + '</span>',
        shouldRenderCopyValue(homeCopy.badges.confirmation) ? '              <span class="curio-home-badge" data-curio-copy-path="home.badges.confirmation">' + (homeCopy.badges.confirmation || '') + '</span>' : ''
      ].filter(Boolean).join('');
    }
    var homeModeDescriptionMarkup = shouldRenderCopyValue(homeCopy.order.homeDesc)
      ? '<small data-curio-copy-path="home.order.homeDesc">' + (homeCopy.order.homeDesc || '') + '</small>'
      : '';
    var officeModeDescriptionMarkup = shouldRenderCopyValue(homeCopy.order.officeDesc)
      ? '<small data-curio-copy-path="home.order.officeDesc">' + (homeCopy.order.officeDesc || '') + '</small>'
      : '';
    var heroMediaMarkup = '';
    if (homeCopy.showHeroMedia === false) {
      heroMediaMarkup = [
        '        <div class="curio-home-hero-copy">',
        '          <span class="curio-home-kicker" data-curio-copy-path="home.kicker">' + homeCopy.kicker + '</span>',
        '          <h1 class="curio-home-title" data-curio-copy-path="home.title">' + homeCopy.title + '</h1>',
        '          <p class="curio-home-lead" data-curio-copy-path="home.lead">' + homeCopy.lead + '</p>',
        '          <div class="curio-home-hero-actions">',
        '            <a class="curio-home-btn" href="#curio-home-order"><span data-curio-copy-path="home.ctas.primary">' + homeCopy.ctas.primary + '</span></a>',
        '            <a class="curio-home-ghost" href="#curio-home-products"><span data-curio-copy-path="home.ctas.secondary">' + homeCopy.ctas.secondary + '</span></a>',
        '          </div>',
        badgeMarkup ? '          <div class="curio-home-badges">' + badgeMarkup + '</div>' : '',
        '        </div>'
      ].filter(Boolean).join('');
    } else {
      heroMediaMarkup = [
        '        <div class="curio-home-hero-grid">',
        '          <div class="curio-home-hero-copy">',
        '            <span class="curio-home-kicker" data-curio-copy-path="home.kicker">' + homeCopy.kicker + '</span>',
        '            <h1 class="curio-home-title" data-curio-copy-path="home.title">' + homeCopy.title + '</h1>',
        '            <p class="curio-home-lead" data-curio-copy-path="home.lead">' + homeCopy.lead + '</p>',
        '            <div class="curio-home-hero-actions">',
        '              <a class="curio-home-btn" href="#curio-home-order"><span data-curio-copy-path="home.ctas.primary">' + homeCopy.ctas.primary + '</span></a>',
        '              <a class="curio-home-ghost" href="#curio-home-products"><span data-curio-copy-path="home.ctas.secondary">' + homeCopy.ctas.secondary + '</span></a>',
        '            </div>',
        badgeMarkup ? '            <div class="curio-home-badges">' + badgeMarkup + '</div>' : '',
        '          </div>',
        '          <figure class="curio-home-hero-media">',
        '            <img src="' + bundle.cover + '" alt="' + bundle.coverAlt + '" loading="eager" style="object-position:' + (bundle.heroPosition || bundle.cardPosition || 'center center') + '">',
        '            <figcaption class="curio-home-hero-note"><strong data-curio-copy-path="home.heroNote.title">' + homeCopy.heroNote.title + '</strong><span data-curio-copy-path="home.heroNote.subtitle">' + homeCopy.heroNote.subtitle + '</span></figcaption>',
        '          </figure>',
        '        </div>'
      ].filter(Boolean).join('');
    }
    var footMarkup = shouldRenderCopyValue(homeCopy.foot) && shouldRenderCopyValue(homeCopy.viewPageLabel)
      ? '    <p class="curio-home-foot" data-curio-copy-path="home.foot">' + homeCopy.foot + '</p>'
      : '';

    document.body.innerHTML = [
      '<div class="curio-home-wrap">',
      '  <div class="curio-home-strip">',
           stripMarkup,
      '  </div>',
      '  <div class="curio-home-shell" id="curio-home-shell">',
      '    <section class="curio-home-hero">',
           heroMediaMarkup,
      '    </section>',
      '    <section id="curio-home-products" class="curio-home-cards">',
             buildHomeCard(goul, homeCopy.cards.goul, homeCopy.viewPageLabel),
             buildHomeCard(roubla, homeCopy.cards.roubla, homeCopy.viewPageLabel),
             buildHomeCard(bundle, homeCopy.cards.bundle, homeCopy.viewPageLabel),
      '    </section>',
      '    <aside class="curio-home-order" id="curio-home-order">',
      '        <h2 data-curio-copy-path="home.order.title">' + homeCopy.order.title + '</h2>',
      '        <p data-curio-copy-path="home.order.intro">' + homeCopy.order.intro + '</p>',
      '        <form class="curio-home-form" id="curio-home-order-form" novalidate>',
      '          <div class="curio-home-field" id="curio-product-group">',
      '            <label for="curio-product-select" data-curio-copy-path="home.order.productLabel">' + homeCopy.order.productLabel + '</label>',
      '            <select id="curio-product-select" name="product_key" aria-label="' + homeCopy.order.productLabel + '" required>',
      '              <option value="goul">' + goul.label + '</option>',
      '              <option value="roubla">' + roubla.label + '</option>',
      '              <option value="bundle">' + bundle.label + '</option>',
      '            </select>',
      '          </div>',
      '          <div class="curio-home-field" id="curio-name-group">',
      '            <label for="curio-first-name" data-curio-copy-path="home.order.nameLabel">' + homeCopy.order.nameLabel + '</label>',
      '            <input id="curio-first-name" name="first_name" type="text" aria-label="' + homeCopy.order.nameLabel + '" autocomplete="name" placeholder="' + homeCopy.order.namePlaceholder + '" required>',
      '          </div>',
      '          <div class="curio-home-field" id="curio-phone-group">',
      '            <label for="curio-phone" data-curio-copy-path="home.order.phoneLabel">' + homeCopy.order.phoneLabel + '</label>',
      '            <input id="curio-phone" name="phone" type="tel" aria-label="' + homeCopy.order.phoneLabel + '" autocomplete="tel" inputmode="numeric" placeholder="' + homeCopy.order.phonePlaceholder + '" required>',
      '          </div>',
      '          <div class="curio-home-field" id="curio-wilaya-group">',
      '            <label for="curio-wilaya" data-curio-copy-path="home.order.wilayaLabel">' + homeCopy.order.wilayaLabel + '</label>',
      '            <select id="curio-wilaya" name="city" aria-label="' + homeCopy.order.wilayaLabel + '" autocomplete="address-level1" data-curio-placeholder="' + STORE_COPY.common.placeholders.wilaya + '" required>',
      '              <option value="">' + STORE_COPY.common.placeholders.wilaya + '</option>',
      '            </select>',
      '          </div>',
      '          <fieldset class="curio-home-field" id="curio-mode-group">',
      '            <legend data-curio-copy-path="home.order.deliveryLegend">' + homeCopy.order.deliveryLegend + '</legend>',
      '            <div class="curio-home-modes">',
      '              <label class="curio-home-mode">',
      '                <input id="curio-delivery-home" type="radio" name="delivery_mode" value="home" aria-label="التوصيل للدار" checked>',
      '                <span><strong data-curio-copy-path="home.order.homeTitle">' + homeCopy.order.homeTitle + '</strong>' + homeModeDescriptionMarkup + '</span>',
      '              </label>',
      '              <label class="curio-home-mode">',
      '                <input id="curio-delivery-office" type="radio" name="delivery_mode" value="office" aria-label="التوصيل للمكتب">',
      '                <span><strong data-curio-copy-path="home.order.officeTitle">' + homeCopy.order.officeTitle + '</strong>' + officeModeDescriptionMarkup + '</span>',
      '              </label>',
      '            </div>',
      '          </fieldset>',
      '          <div class="curio-home-field" id="curio-address-group">',
      '            <label for="curio-address" data-curio-copy-path="home.order.addressLabel">' + homeCopy.order.addressLabel + '</label>',
      '            <textarea id="curio-address" name="address" aria-label="' + homeCopy.order.addressLabel + '" autocomplete="street-address" placeholder="' + homeCopy.order.addressPlaceholder + '" required></textarea>',
      '          </div>',
      '          <div class="curio-home-field is-hidden" id="curio-office-group">',
      '            <label for="curio-office" data-curio-copy-path="home.order.officeLabel">' + homeCopy.order.officeLabel + '</label>',
      '            <select id="curio-office" name="office_pickup" aria-label="اختار المكتب" autocomplete="off">',
      '              <option value="">' + STORE_COPY.common.placeholders.officeBeforeWilaya + '</option>',
      '            </select>',
      '          </div>',
      '          <div class="curio-home-summary">',
      '            <div class="curio-home-summary-row"><span data-curio-copy-path="home.summary.productLabel">' + homeCopy.summary.productLabel + '</span><span id="curio-summary-product-label">' + goul.label + '</span></div>',
      '            <div class="curio-home-summary-row"><span data-curio-copy-path="home.summary.productPriceLabel">' + homeCopy.summary.productPriceLabel + '</span><span id="curio-summary-product-price">' + formatDA(goul.price) + '</span></div>',
      '            <div class="curio-home-summary-row"><span data-curio-copy-path="home.summary.deliveryPriceLabel">' + homeCopy.summary.deliveryPriceLabel + '</span><span id="curio-summary-delivery-price">' + STORE_COPY.common.summary.chooseWilaya + '</span></div>',
      '            <div class="curio-home-summary-row total"><span data-curio-copy-path="home.summary.totalLabel">' + homeCopy.summary.totalLabel + '</span><span id="curio-summary-total">' + STORE_COPY.common.summary.totalPending + '</span></div>',
      '            <p class="curio-home-summary-note" id="curio-summary-note" data-curio-copy-path="common.summary.homeDefault">' + STORE_COPY.common.summary.homeDefault + '</p>',
      '          </div>',
      '          <div class="form-message" id="curio-form-message" aria-live="polite"></div>',
      '          <button class="curio-home-submit submit-btn" id="curio-submit-btn" type="submit"><span data-curio-copy-path="common.buttons.submit">' + STORE_COPY.common.buttons.submit + '</span></button>',
      '        </form>',
      '    </aside>',
      '    <section class="curio-home-note">',
      '      <div class="curio-home-note-grid">',
             homeCopy.notes.map(function (item, index) {
               return '        <article class="curio-home-note-item"><strong data-curio-copy-path="home.notes.' + index + '.title">' + item.title + '</strong><p data-curio-copy-path="home.notes.' + index + '.body">' + item.body + '</p></article>';
             }).join(''),
      '      </div>',
      '    </section>',
           footMarkup,
      '  </div>',
      '</div>'
    ].join('');
  }

  function buildProductPagePanel(product) {
    var panelCopy = STORE_COPY.productPanel;
    var panel = document.createElement('section');
    panel.className = 'curio-delivery-panel';
    panel.id = 'curio-product-delivery-panel';
    panel.innerHTML = [
      '<h3 data-curio-copy-path="productPanel.title">' + panelCopy.title + '</h3>',
      '<div class="curio-field" id="curio-mode-field">',
      '  <label data-curio-copy-path="productPanel.deliveryLegend">' + panelCopy.deliveryLegend + '</label>',
      '  <div class="curio-mode-grid">',
      '    <label class="curio-mode-option">',
      '      <input type="radio" name="delivery_mode" value="home" checked>',
      '      <span><strong data-curio-copy-path="productPanel.homeTitle">' + panelCopy.homeTitle + '</strong><small data-curio-copy-path="productPanel.homeDesc">' + panelCopy.homeDesc + '</small></span>',
      '    </label>',
      '    <label class="curio-mode-option">',
      '      <input type="radio" name="delivery_mode" value="office">',
      '      <span><strong data-curio-copy-path="productPanel.officeTitle">' + panelCopy.officeTitle + '</strong><small data-curio-copy-path="productPanel.officeDesc">' + panelCopy.officeDesc + '</small></span>',
      '    </label>',
      '  </div>',
      '</div>',
      '<div class="curio-field" id="curio-home-address-field">',
      '  <label for="curio-home-address-input" data-curio-copy-path="productPanel.addressLabel">' + panelCopy.addressLabel + '</label>',
      '  <textarea id="curio-home-address-input" placeholder="' + panelCopy.addressPlaceholder + '"></textarea>',
      '</div>',
      '<div class="curio-field curio-hidden" id="curio-office-field">',
      '  <label for="curio-office-select" data-curio-copy-path="productPanel.officeLabel">' + panelCopy.officeLabel + '</label>',
      '  <select id="curio-office-select" disabled>',
      '    <option value="">' + STORE_COPY.common.placeholders.officeBeforeWilaya + '</option>',
      '  </select>',
      '  <p class="curio-field-note" id="curio-office-note" data-curio-copy-path="productPanel.officeHint">' + panelCopy.officeHint + '</p>',
      '</div>',
      '<div class="curio-summary">',
      '  <div class="curio-summary-row"><span data-curio-copy-path="productPanel.summary.productLabel">' + panelCopy.summary.productLabel + '</span><span id="curio-product-summary-label">' + product.label + '</span></div>',
      '  <div class="curio-summary-row"><span data-curio-copy-path="productPanel.summary.productPriceLabel">' + panelCopy.summary.productPriceLabel + '</span><span id="curio-product-summary-price">' + formatDA(product.price) + '</span></div>',
      '  <div class="curio-summary-row"><span data-curio-copy-path="productPanel.summary.deliveryPriceLabel">' + panelCopy.summary.deliveryPriceLabel + '</span><span id="curio-product-summary-delivery">' + STORE_COPY.common.summary.chooseWilaya + '</span></div>',
      '  <div class="curio-summary-row total"><span data-curio-copy-path="productPanel.summary.totalLabel">' + panelCopy.summary.totalLabel + '</span><span id="curio-product-summary-total">' + STORE_COPY.common.summary.totalPending + '</span></div>',
      '</div>',
      '<div class="curio-message" id="curio-product-message" aria-live="polite"></div>',
      '<p class="curio-product-inline-note" data-curio-copy-path="productPanel.inlineNote">' + panelCopy.inlineNote + '</p>'
    ].join('');

    return panel;
  }

  function enhanceProductPageCheckout() {
    var form = document.getElementById('express-checkout-form');
    var submitButton = document.querySelector('button.single-submit');

    if (!form || !submitButton || document.getElementById('curio-product-delivery-panel')) {
      return;
    }

    var cityInput = form.querySelector('input[name="city"]');
    var phoneInput = form.querySelector('input[name="phone"]');
    var extraPayloadInput = form.querySelector('input[name="extra_payload"]');
    var productIdInput = form.querySelector('input[name="id"]');
    var product = productIdInput ? getProductById(productIdInput.value) : null;

    if (!cityInput || !phoneInput || !extraPayloadInput || !product) {
      return;
    }

    var cityGroup = cityInput.closest('.form-group');
    var phoneGroup = phoneInput.closest('.form-group');
    var citySelect = document.createElement('select');
    citySelect.name = cityInput.name;
    citySelect.className = cityInput.className;
    citySelect.required = true;
    citySelect.setAttribute('aria-label', repairText(STORE_COPY.common.labels.wilaya));
    citySelect.setAttribute('data-curio-placeholder', repairText(STORE_COPY.common.placeholders.wilaya));
    populateWilayaSelect(citySelect, cityInput.value);
    cityInput.parentNode.replaceChild(citySelect, cityInput);

    bindPhoneInput(phoneInput, phoneGroup, null);

    var panel = buildProductPagePanel(product);
    form.insertAdjacentElement('afterend', panel);

    var addressField = panel.querySelector('#curio-home-address-field');
    var officeField = panel.querySelector('#curio-office-field');
    var addressInput = panel.querySelector('#curio-home-address-input');
    var officeSelect = panel.querySelector('#curio-office-select');
    var message = panel.querySelector('#curio-product-message');
    var summaryDelivery = panel.querySelector('#curio-product-summary-delivery');
    var summaryTotal = panel.querySelector('#curio-product-summary-total');

    function updateProductPageState() {
      clearMessage(message);

      var record = getDeliveryRecordByLabel(citySelect.value);
      var mode = getSelectedMode(panel);
      var officeValue = officeSelect.value;
      var fee = null;

      addressField.classList.toggle('curio-hidden', mode !== 'home');
      officeField.classList.toggle('curio-hidden', mode !== 'office');

      if (record) {
        populateOfficeSelect(officeSelect, record, officeValue);
      } else {
        populateOfficeSelect(officeSelect, null, '');
      }

      if (mode === 'office' && record && record.offices.length === 0) {
        showMessage(message, 'info', STORE_COPY.common.messages.noOfficeConfigured);
      }

      if (!record) {
        summaryDelivery.textContent = repairText(STORE_COPY.common.summary.chooseWilaya);
        summaryTotal.textContent = STORE_COPY.common.summary.totalPending;
        extraPayloadInput.value = '';
        return;
      }

      if (!record.hasFees) {
        summaryDelivery.textContent = repairText(STORE_COPY.common.summary.unavailable);
        summaryTotal.textContent = repairText(STORE_COPY.common.summary.unavailable);
        showMessage(message, 'info', STORE_COPY.common.messages.shippingUnavailable);
        extraPayloadInput.value = '';
        return;
      }

      if (mode === 'office' && record.offices.length === 0) {
        summaryDelivery.textContent = repairText(STORE_COPY.common.summary.unavailable);
        summaryTotal.textContent = repairText(STORE_COPY.common.summary.unavailable);
        showMessage(message, 'info', STORE_COPY.common.messages.noOfficeConfigured);
        extraPayloadInput.value = '';
        return;
      }

      fee = mode === 'office' ? record.office : record.home;
      summaryDelivery.textContent = formatDA(fee);
      summaryTotal.textContent = formatDA(product.price + fee);
      extraPayloadInput.value = buildExtraPayload(product, record, mode, addressInput.value.trim(), officeSelect.value);
    }

    function validateProductPageState() {
      var mode = getSelectedMode(panel);
      var record = getDeliveryRecordByLabel(citySelect.value);
      var valid = true;

      setFieldInvalid(cityGroup, false);
      setFieldInvalid(phoneGroup, false);
      setFieldInvalid(addressField, false);
      setFieldInvalid(officeField, false);

      if (!citySelect.value || !record) {
        valid = false;
        setFieldInvalid(cityGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.chooseWilayaBeforeContinue);
      } else if (!record.hasFees) {
        valid = false;
        setFieldInvalid(cityGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.shippingUnavailable);
      } else if (!isValidPhone(phoneInput.value)) {
        valid = false;
        setFieldInvalid(phoneGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.invalidPhone);
      } else if (mode === 'home' && !addressInput.value.trim()) {
        valid = false;
        setFieldInvalid(addressField, true);
        showMessage(message, 'error', STORE_COPY.common.messages.enterAddressLong);
      } else if (mode === 'office' && record.offices.length === 0) {
        valid = false;
        setFieldInvalid(officeField, true);
        showMessage(message, 'error', STORE_COPY.common.messages.noOfficesAvailable);
      } else if (mode === 'office' && !officeSelect.value) {
        valid = false;
        setFieldInvalid(officeField, true);
        showMessage(message, 'error', STORE_COPY.common.messages.chooseOffice);
      }

      if (valid) {
        extraPayloadInput.value = buildExtraPayload(product, record, mode, addressInput.value.trim(), officeSelect.value);
      }

      return valid;
    }

    citySelect.addEventListener('change', updateProductPageState);
    panel.querySelectorAll('input[name="delivery_mode"]').forEach(function (radio) {
      radio.addEventListener('change', updateProductPageState);
    });
    addressInput.addEventListener('input', updateProductPageState);
    officeSelect.addEventListener('change', updateProductPageState);
    phoneInput.addEventListener('input', updateProductPageState);
    submitButton.addEventListener('click', function (event) {
      if (!validateProductPageState()) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') {
          event.stopImmediatePropagation();
        }
      }
    }, true);

    updateProductPageState();
  }

  function enhanceHomePageForm() {
    var form = document.getElementById('curio-home-order-form');

    if (!form) {
      return;
    }

    var productSelect = form.querySelector('#curio-product-select');
    var nameInput = form.querySelector('#curio-first-name');
    var phoneInput = form.querySelector('#curio-phone');
    var wilayaSelect = form.querySelector('#curio-wilaya');
    var addressGroup = form.querySelector('#curio-address-group');
    var addressInput = form.querySelector('#curio-address');
    var officeGroup = form.querySelector('#curio-office-group');
    var officeSelect = form.querySelector('#curio-office');
    var submitButton = form.querySelector('#curio-submit-btn');
    var message = form.querySelector('#curio-form-message');
    var productGroup = form.querySelector('#curio-product-group');
    var nameGroup = form.querySelector('#curio-name-group');
    var phoneGroup = form.querySelector('#curio-phone-group');
    var wilayaGroup = form.querySelector('#curio-wilaya-group');
    var summaryLabel = form.querySelector('#curio-summary-product-label');
    var summaryProductPrice = form.querySelector('#curio-summary-product-price');
    var summaryDeliveryPrice = form.querySelector('#curio-summary-delivery-price');
    var summaryTotal = form.querySelector('#curio-summary-total');
    var summaryNote = form.querySelector('#curio-summary-note');
    var productCards = document.querySelectorAll('[data-curio-product-card]');
    var pickerButtons = document.querySelectorAll('[data-curio-pick]');

    populateWilayaSelect(wilayaSelect, '');
    bindPhoneInput(phoneInput, phoneGroup, message);

    function getSelectedHomeProduct() {
      return getProductByKey(productSelect.value);
    }

    function updateSelectedCard(productKey) {
      productCards.forEach(function (card) {
        card.classList.toggle('is-selected', card.getAttribute('data-curio-product-card') === productKey);
      });
    }

    function updateHomeState() {
      clearMessage(message);

      var product = getSelectedHomeProduct();
      var record = getDeliveryRecordByLabel(wilayaSelect.value);
      var mode = getSelectedMode(form);
      var officeValue = officeSelect.value;
      var fee = null;

      updateSelectedCard(product.key);

      summaryLabel.textContent = product.label;
      summaryProductPrice.textContent = formatDA(product.price);

      addressGroup.classList.toggle('is-hidden', mode !== 'home');
      officeGroup.classList.toggle('is-hidden', mode !== 'office');

      if (record) {
        populateOfficeSelect(officeSelect, record, officeValue);
      } else {
        populateOfficeSelect(officeSelect, null, '');
      }

      if (!record) {
        summaryDeliveryPrice.textContent = repairText(STORE_COPY.common.summary.chooseWilaya);
        summaryTotal.textContent = STORE_COPY.common.summary.totalPending;
        summaryNote.textContent = repairText(STORE_COPY.common.summary.homeDefault);
        return;
      }

      if (!record.hasFees) {
        summaryDeliveryPrice.textContent = repairText(STORE_COPY.common.summary.unavailable);
        summaryTotal.textContent = repairText(STORE_COPY.common.summary.unavailable);
        summaryNote.textContent = repairText(STORE_COPY.common.summary.noShipping);
        return;
      }

      if (mode === 'office' && record.offices.length === 0) {
        summaryDeliveryPrice.textContent = repairText(STORE_COPY.common.summary.unavailable);
        summaryTotal.textContent = repairText(STORE_COPY.common.summary.unavailable);
        summaryNote.textContent = repairText(STORE_COPY.common.summary.noOffice);
        return;
      }

      fee = mode === 'office' ? record.office : record.home;
      summaryDeliveryPrice.textContent = formatDA(fee);
      summaryTotal.textContent = formatDA(product.price + fee);
      summaryNote.textContent = repairText(mode === 'office'
        ? STORE_COPY.common.summary.officeReady
        : STORE_COPY.common.summary.homeReady);
    }

    function validateHomeState() {
      var product = getSelectedHomeProduct();
      var record = getDeliveryRecordByLabel(wilayaSelect.value);
      var mode = getSelectedMode(form);
      var valid = true;

      setFieldInvalid(productGroup, false);
      setFieldInvalid(nameGroup, false);
      setFieldInvalid(phoneGroup, false);
      setFieldInvalid(wilayaGroup, false);
      setFieldInvalid(addressGroup, false);
      setFieldInvalid(officeGroup, false);

      if (!product) {
        valid = false;
        setFieldInvalid(productGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.chooseProduct);
      } else if (!nameInput.value.trim()) {
        valid = false;
        setFieldInvalid(nameGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.enterName);
      } else if (!isValidPhone(phoneInput.value)) {
        valid = false;
        setFieldInvalid(phoneGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.invalidPhone);
      } else if (!wilayaSelect.value || !record) {
        valid = false;
        setFieldInvalid(wilayaGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.chooseWilaya);
      } else if (!record.hasFees) {
        valid = false;
        setFieldInvalid(wilayaGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.shippingUnavailable);
      } else if (mode === 'home' && !addressInput.value.trim()) {
        valid = false;
        setFieldInvalid(addressGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.enterAddressShort);
      } else if (mode === 'office' && record.offices.length === 0) {
        valid = false;
        setFieldInvalid(officeGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.noOfficesAvailable);
      } else if (mode === 'office' && !officeSelect.value) {
        valid = false;
        setFieldInvalid(officeGroup, true);
        showMessage(message, 'error', STORE_COPY.common.messages.chooseOffice);
      }

      return valid;
    }

    pickerButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-curio-pick');
        if (!PRODUCT_CATALOG[key]) {
          return;
        }

        productSelect.value = key;
        updateHomeState();
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    productSelect.addEventListener('change', updateHomeState);
    wilayaSelect.addEventListener('change', updateHomeState);
    addressInput.addEventListener('input', updateHomeState);
    officeSelect.addEventListener('change', updateHomeState);
    form.querySelectorAll('input[name="delivery_mode"]').forEach(function (radio) {
      radio.addEventListener('change', updateHomeState);
    });
    phoneInput.addEventListener('input', updateHomeState);
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!validateHomeState()) {
        return;
      }

      var product = getSelectedHomeProduct();
      var record = getDeliveryRecordByLabel(wilayaSelect.value);
      var mode = getSelectedMode(form);
      var wilayaCode = String(record.code).padStart(2, '0');
      var couponInput = form.querySelector('#curio-coupon-input');

      // Build the office info from the selected office
      var selectedOffice = null;
      if (mode === 'office' && officeSelect.value) {
        var offices = record.offices || [];
        for (var i = 0; i < offices.length; i++) {
          if (offices[i].value === officeSelect.value) {
            selectedOffice = offices[i];
            break;
          }
        }
      }

      var payload = {
        items: [{ slug: PRODUCT_SLUGS[product.key] || product.key, quantity: 1 }],
        customerName: nameInput.value.trim(),
        customerPhone: sanitizePhone(phoneInput.value),
        wilayaCode: wilayaCode,
        deliveryType: mode === 'office' ? 'OFFICE' : 'HOME',
        address: mode === 'home' ? addressInput.value.trim() : null,
        officeName: selectedOffice ? selectedOffice.station : null,
        officeCommune: selectedOffice ? selectedOffice.commune : null,
        couponCode: couponInput && couponInput.value ? couponInput.value.trim() : null
      };

      submitButton.classList.add('is-loading');
      submitButton.textContent = repairText(STORE_COPY.common.buttons.submitLoading);
      clearMessage(message);

      fetch(CURIO_API + '/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data.success) {
            showMessage(message, 'success', result.data.message || STORE_COPY.common.messages.submitSuccess);
            // Reset form after successful order
            form.reset();
            updateHomeState();
          } else {
            showMessage(message, 'error', result.data.error || repairText(STORE_COPY.common.messages.fallback));
          }
        })
        .catch(function () {
          showMessage(message, 'error', repairText(STORE_COPY.common.messages.fallback));
        })
        .finally(function () {
          submitButton.classList.remove('is-loading');
          submitButton.textContent = repairText(STORE_COPY.common.buttons.submit);
        });
    });

    updateHomeState();
  }

  normalizeProducts();
  normalizeDeliveryData();
  loadCopyDraft();
  repairCopyTree(STORE_COPY);
  loadFont();
  injectStyles();
  renderStoreHomePage();
  enhanceCommonPagePolish();
  enhanceProductPageCheckout();
  enhanceHomePageForm();
  attachCopyEditor();
});

