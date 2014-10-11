define(['text!core/content/tracks.json', './utility'], function (TrackDefinitions, Utility)
{
    'use strict';

    function getInactiveChannel(sound)
    {
        for (var i = 0; i < sound.channels.length; i++)
        {
            var channel = sound.channels[i];
            if (channel.paused || channel.ended)
            {
                channel.currentTime = 0;
                if (channel.currentTime !== 0)
                    channel.load();

                return channel;
            }
        }

        return loadChannel(sound);
    }

    function loadChannel(sound)
    {
        var audio = new Audio('core/content/sounds/' + sound.name + sound.format);
        if (!sound.isLoaded)
        {
            audio.addEventListener('canplaythrough', function onAudioLoaded()
            {
                sound.isLoaded = true;
                if (sound.onLoaded)
                    sound.onLoaded();

                audio.removeEventListener('canplaythrough', onAudioLoaded, false);
            }, false);

            audio.addEventListener('error', function (e)
            {
                if (console.log)
                    console.log('audio load error', e);
            }, false);
        }

        audio.preload = 'auto';
        audio.load();

        sound.channels.push(audio);
        return audio;
    }


    function Sound(config, format)
    {
        this.name = config.name;
        this.format = format;
        this.volume = config.volume;

        this.channels = [];
        this.isLoaded = false;
        loadChannel(this);
    }

    Sound.prototype.play = function (volume, onComplete)
    {
        if (this.isLoaded)
        {
            var audio = getInactiveChannel(this);
            audio.volume = volume * this.volume;

            if (onComplete)
            {
                audio.addEventListener('ended', function handleOnComplete()
                {
                    audio.removeEventListener('ended', handleOnComplete);
                    onComplete();
                }, false);
            }

            audio.play();
        }
        else
        {
            this.onLoaded = function ()
            {
                this.play(volume, onComplete);
                this.onLoaded = null;
            };
        }
    };

    Sound.prototype.stop = function ()
    {
        for (var i = 0; i < this.channels.length; i++)
            this.channels[i].pause();
    };


    function Track(trackData, sounds, configVolume, format)
    {
        this.soundConfigs = [];
        if (trackData)
        {
            // Get the data in the right format
            if (Array.isArray(trackData) || typeof trackData !== 'object')
                trackData = {sounds: trackData};

            if (!Array.isArray(trackData.sounds))
                trackData.sounds = [trackData.sounds];

            // Set the track level data
            this.loop = trackData.loop;
            this.configVolume = configVolume;
            this.volume = trackData.volume || 1;

            // Set the sound level data
            for (var i = 0; i < trackData.sounds.length; i++)
            {
                var soundData = trackData.sounds[i];
                var soundConfig = {delay: 0, volume: 1};

                if (typeof soundData === 'string')
                    soundConfig.name = soundData;
                else
                    Utility.merge(soundConfig, soundData);

                var sound = sounds[soundConfig.name];
                if (!sound)
                {
                    sound = new Sound(soundConfig, format);
                    sounds[soundConfig.name] = sound;
                }

                soundConfig.sound = sound;
                this.soundConfigs.push(soundConfig);
            }
        }
    }

    Track.prototype.play = function (volume)
    {
        this.playSound(0, volume);
    };

    Track.prototype.playSound = function (index, volume)
    {
        if (this.loop && index >= this.soundConfigs.length)
            index = 0;

        var soundConfig = this.soundConfigs[index];
        if (soundConfig)
        {
            var self = this;
            setTimeout(function ()
            {
                soundConfig.sound.play(self.volume * volume, function ()
                {
                    self.playSound(++index, volume);
                });
            }, soundConfig.delay);
        }
    };

    Track.prototype.stop = function ()
    {
        for (var i = 0; i < this.soundConfigs.length; i++)
            this.soundConfigs[i].sound.stop();
    };

    return {
        trackDefinitions: JSON.parse(TrackDefinitions),
        isEnabled: true,
        sounds: [],
        tracks: [],
        globalVolume: 1,
        musicVolume: 1,
        soundEffectVolume: 1,

        getTrack: function (name, autoLoad)
        {
            var track = this.tracks[name];
            if (!track && autoLoad !== false)
                return this.loadTrack(name);

            return track || new Track();
        },

        isAudioSupported: function ()
        {
            if (this.format == null && window.Audio != null)
            {
                var audio = new Audio();
                if (audio.canPlayType('audio/ogg; codecs=vorbis'))
                    this.format = '.ogg';
                else if (audio.canPlayType('audio/mp4; codecs="mp4a.40.5"'))
                    this.format = '.mp4';
            }

            return this.format != null;
        },

        loadTrack: function (name)
        {
            if (this.isEnabled && this.isAudioSupported())
            {
                var configVolume;
                var trackDefinition = this.trackDefinitions.effects[name];
                if (trackDefinition)
                {
                    configVolume = this.soundEffectVolume;
                }
                else
                {
                    trackDefinition = this.trackDefinitions.music[name];
                    if (trackDefinition)
                        configVolume = this.musicVolume;
                }

                if (trackDefinition)
                {
                    var track = new Track(trackDefinition, this.sounds, configVolume, this.format);
                    this.tracks[name] = track;
                    return track;
                }
            }

            return new Track();
        },

        playTrack: function (name, volume)
        {
            var track = this.getTrack(name);
            if (track)
            {
                track.play(this.globalVolume * track.configVolume * (volume || 1));
            }
        },

        stopTrack: function (name)
        {
            var track = this.getTrack(name);
            if (track)
            {
                track.stop();
            }
        },

        unload: function ()
        {
            this.sounds.length = 0;
            this.tracks.length = 0;
        },

        unloadTrack: function (name)
        {
            delete this.tracks[name];
        }
    };
});
