<?php

/**
 * GET/POST /handlers/front/init
 *
 * In real PeakAgent this returns the website config, theme, MLS metadata, etc.
 * Here it returns a hardcoded subset so the frontend can hit a real endpoint
 * during bootstrap if you want to mirror the real app's layout pattern.
 *
 * You probably don't need to change this for the test.
 */

_ej([
    'ok'          => 1,
    'type'        => 'website',
    'domain'      => 'interview.local',
    'website'     => [
        'id'          => 1,
        'name'        => 'PeakAgent Interview',
        'agent_name'  => 'Demo Agent',
    ],
    'mlses'       => [
        ['id' => 1, 'name' => 'Demo MLS', 'acronym' => 'DMLS', 'city' => 'Anywhere', 'state' => 'XX'],
    ],
    'features'    => [
        'listing_search' => true,
    ],
]);
