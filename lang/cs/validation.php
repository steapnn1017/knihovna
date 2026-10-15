<?php

// České chybové hlášky validace (APP_LOCALE=cs v .env).

return [
    'accepted' => 'Pole :attribute musí být přijato.',
    'boolean' => 'Pole :attribute musí být ano, nebo ne.',
    'confirmed' => 'Potvrzení pole :attribute se neshoduje.',
    'current_password' => 'Heslo není správné.',
    'email' => 'Pole :attribute musí být platná e-mailová adresa.',
    'exists' => 'Vybraná hodnota pole :attribute je neplatná.',
    'in' => 'Vybraná hodnota pole :attribute je neplatná.',
    'integer' => 'Pole :attribute musí být celé číslo.',
    'lowercase' => 'Pole :attribute musí být malými písmeny.',
    'max' => [
        'numeric' => 'Pole :attribute nesmí být větší než :max.',
        'string' => 'Pole :attribute může mít nejvýše :max znaků.',
        'array' => 'Pole :attribute může obsahovat nejvýše :max položek.',
        'file' => 'Soubor :attribute může mít nejvýše :max kB.',
    ],
    'min' => [
        'numeric' => 'Pole :attribute musí být alespoň :min.',
        'string' => 'Pole :attribute musí mít alespoň :min znaků.',
        'array' => 'Pole :attribute musí obsahovat alespoň :min položek.',
        'file' => 'Soubor :attribute musí mít alespoň :min kB.',
    ],
    'numeric' => 'Pole :attribute musí být číslo.',
    'password' => [
        'letters' => 'Pole :attribute musí obsahovat alespoň jedno písmeno.',
        'mixed' => 'Pole :attribute musí obsahovat velké i malé písmeno.',
        'numbers' => 'Pole :attribute musí obsahovat alespoň jedno číslo.',
        'symbols' => 'Pole :attribute musí obsahovat alespoň jeden speciální znak.',
        'uncompromised' => 'Toto heslo se objevilo v úniku dat. Zvolte prosím jiné.',
    ],
    'regex' => 'Formát pole :attribute je neplatný.',
    'required' => 'Pole :attribute je povinné.',
    'same' => 'Pole :attribute a :other se musí shodovat.',
    'string' => 'Pole :attribute musí být text.',
    'unique' => 'Hodnota pole :attribute už je použitá.',
    'url' => 'Pole :attribute musí být platná URL adresa.',

    'custom' => [],

    'attributes' => [
        'name' => 'jméno',
        'email' => 'e-mail',
        'password' => 'heslo',
        'password_confirmation' => 'potvrzení hesla',
        'current_password' => 'současné heslo',
        'q' => 'hledaný výraz',
        'stav' => 'stav',
        'zanr' => 'žánr',
        'open_library_key' => 'kniha',
        'code' => 'kód',
    ],
];
